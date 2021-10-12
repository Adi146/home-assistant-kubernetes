import {
  LitElement,
  html,
  css,
} from "lit";
import { haStyle } from "../home-assistant/src/resources/styles.ts";

import "./table-card.js"

class KubernetesPanel extends LitElement {
  constructor() {
    super()
    this.table = document.createElement("table-card");
  }

  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  getConfig() {
    return {
      columns: [
        { header: "Name", path: "attributes.metadata.name" },
        { header: "Namespace", path: "attributes.metadata.namespace" },
        { header: "State", path: "state"}
      ],
      filters: {
        "attributes.device_class": this.route.path.substring(1),
      }
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
        </app-toolbar>
      </app-header>

      <table-card
        .hass=${this.hass}
        .config=${this.getConfig()}
      ></table-card>
    </ha-app-layout>
    `;
  }

  handlePageSelected(ev) {
    const newPage = ev.detail.item.getAttribute("page-name");
    if (newPage !== this._page) {
      //window.location.href = `/kubernetes-frontend/${newPage}`;
      window.history.pushState(null, "", `/kubernetes-frontend/${newPage}`);

      const event = new Event("location-changed", {});
      window.dispatchEvent(event);
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
    `];
  }
}

customElements.define("kubernetes-frontend", KubernetesPanel);