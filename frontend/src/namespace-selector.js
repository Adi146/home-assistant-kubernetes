import { LitElement, html, css } from "lit";
import { fireEvent } from "card-tools/src/event";

export class NamespaceSelector extends LitElement {
  constructor() {
    super();
    // This is a workaround to load the ha-paper-dropdown-menu.
    // See https://github.com/home-assistant/frontend/issues/7098 for more details.
    window.loadCardHelpers().then((helpers) => {
      helpers.createRowElement({ type: "input-select-entity" });
    });
  }

  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
      config: {},
    };
  }

  setConfig(config) {
    this.config = config;
  }

  render() {
    return html`
      <ha-paper-dropdown-menu
        label="Namespaces"
        @value-changed=${(e) => {
          fireEvent("namespace-changed", { namespace: e.detail.value }, this);
        }}
      >
        <paper-listbox slot="dropdown-content" selected="0">
          <paper-item>all</paper-item>
          ${Object.values(this.hass.states)
            .filter((state) => {
              return state.attributes.device_class == "Namespace";
            })
            .map((state) => {
              return html`
                <paper-item>${state.attributes.metadata.name}</paper-item>
              `;
            })}
        </paper-listbox>
      </ha-paper-dropdown-menu>
    `;
  }

  static get styles() {
    return css``;
  }
}

customElements.define("namespace-selector", NamespaceSelector);
