import { LitElement, html, css } from "lit";
import { haStyle } from "../home-assistant/src/resources/styles.ts";
import { fireEvent } from "card-tools/src/event";

import "./table-card.js";
import "./component-details-card.js";
import "./namespace-selector.js";
import {
  stateSuccess,
  stateWarning,
  stateError,
  getName,
  getNamespace,
  getConditionsAsSpans,
  getConditionsStrings,
  getNodeSchedulable,
  getNodeSchedulableIcon,
  getAge,
  getAgeStr,
  getState,
  getNodeName,
  getReplicaStr,
} from "./helpers.js";

const componentDetailsCardName = "custom:k8s-component-details";

class KubernetesPanel extends LitElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
      namespace: { type: String },
    };
  }

  getConfig() {
    var filterByPage = function (state) {
      return state.attributes.device_class === this._page;
    }.bind(this);
    var filterByNamespace = function (state) {
      if (this.namespace && this.namespace != "all") {
        return getNamespace(state) === this.namespace;
      }
      return true;
    }.bind(this);

    switch (this._page) {
      case "Node":
        var conditionFilter = {
          NetworkUnavailable: stateWarning,
          MemoryPressure: stateWarning,
          DiskPressure: stateWarning,
          PIDPressure: stateWarning,
        };

        return {
          popUpCard: {
            type: componentDetailsCardName,
          },
          columns: {
            Name: {
              value: getName,
              sort_value: getName,
            },
            Schedulable: {
              value: getNodeSchedulableIcon,
              sort_value: getNodeSchedulable,
            },
            Age: {
              value: getAgeStr,
              sort_value: getAge,
            },
            Conditions: {
              value: getConditionsAsSpans.bind(conditionFilter),
              sort_value: getConditionsStrings.bind(conditionFilter),
            },
          },
          filter_functions: [filterByPage],
        };
      case "Deployment":
        var conditionFilter = {
          Progressing: stateWarning,
        };

        return {
          popUpCard: {
            type: componentDetailsCardName,
          },
          columns: {
            Name: {
              value: getName,
              sort_value: getName,
            },
            Namespace: {
              value: getNamespace,
              sort_value: getNamespace,
            },
            Replicas: {
              value: getReplicaStr,
              sort_value: getReplicaStr,
            },
            Age: {
              value: getAgeStr,
              sort_value: getAge,
            },
            Conditions: {
              value: getConditionsAsSpans.bind(conditionFilter),
              sort_value: getConditionsStrings.bind(conditionFilter),
            },
          },
          filter_functions: [filterByPage, filterByNamespace],
        };
      case "DaemonSet":
        return {
          popUpCard: {
            type: componentDetailsCardName,
          },
          columns: {
            Name: {
              value: getName,
              sort_value: getName,
            },
            Namespace: {
              value: getNamespace,
              sort_value: getNamespace,
            },
            Replicas: {
              value: getReplicaStr,
              sort_value: getReplicaStr,
            },
            Age: {
              value: getAgeStr,
              sort_value: getAge,
            },
          },
          filter_functions: [filterByPage, filterByNamespace],
        };
      case "Pod":
        var conditionFilter = {
          Initialized: stateWarning,
          ContainersReady: stateWarning,
          PodScheduled: stateWarning,
        };

        return {
          popUpCard: {
            type: componentDetailsCardName,
          },
          columns: {
            Name: {
              value: getName,
              sort_value: getName,
            },
            Namespace: {
              value: getNamespace,
              sort_value: getNamespace,
            },
            Node: {
              value: getNodeName,
              sort_value: getNodeName,
            },
            State: {
              value: getState,
              sort_value: getState,
            },
            Age: {
              value: getAgeStr,
              sort_value: getAge,
            },
            Conditions: {
              value: getConditionsAsSpans.bind(conditionFilter),
              sort_value: getConditionsStrings.bind(conditionFilter),
            },
          },
          filter_functions: [filterByPage, filterByNamespace],
        };
    }
  }

  render() {
    const page = this._page;
    return html`
      <ha-app-layout>
        <app-header fixed slot="header">
          <app-toolbar>
            <ha-menu-button
              .hass=${this.hass}
              .narrow=${this.narrow}
            ></ha-menu-button>
            <ha-tabs
              scrollable
              attr-for-selected="page-name"
              .selected=${page}
              @iron-activate=${this.handlePageSelected}
            >
              <paper-tab page-name="Node">Nodes</paper-tab>
              <paper-tab page-name="Deployment">Deployments</paper-tab>
              <paper-tab page-name="DaemonSet">DaemonSets</paper-tab>
              <paper-tab page-name="Pod">Pods</paper-tab>
            </ha-tabs>

            ${!this.narrow
              ? html` <namespace-selector
                  .hass=${this.hass}
                  @namespace-changed=${(e) =>
                    (this.namespace = e.detail.namespace)}
                ></namespace-selector>`
              : html``}
          </app-toolbar>
          ${this.narrow
            ? html` <namespace-selector
                .hass=${this.hass}
                @namespace-changed=${(e) =>
                  (this.namespace = e.detail.namespace)}
              ></namespace-selector>`
            : html``}
        </app-header>
        ${page
          ? html`
              <table-card
                .hass=${this.hass}
                .config=${this.getConfig()}
              ></table-card>
            `
          : html``}
      </ha-app-layout>
    `;
  }

  handlePageSelected(ev) {
    const newPage = ev.detail.item.getAttribute("page-name");
    if (newPage !== this._page) {
      window.history.pushState(null, "", `/kubernetes-frontend/${newPage}`);
      fireEvent("location-changed", {}, window);
    } else {
      scrollTo(0, 0);
    }
  }

  get _page() {
    return this.route.path.substr(1);
  }

  static get styles() {
    return [
      haStyle,
      css`
        :host {
          display: block;
        }
        ha-tabs {
          width: 100%;
          height: 100%;
          margin-left: 4px;
        }
        paper-tabs {
          margin-left: 12px;
          margin-left: max(env(safe-area-inset-left), 12px);
          margin-right: env(safe-area-inset-right);
        }
        ha-tabs,
        paper-tabs {
          --paper-tabs-selection-bar-color: var(
            --app-header-selection-bar-color,
            var(--app-header-text-color, #fff)
          );
          text-transform: uppercase;
        }
        namespace-selector {
          margin: 20px;
        }
      `,
    ];
  }
}

customElements.define("kubernetes-frontend", KubernetesPanel);
