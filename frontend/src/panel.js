import {
  LitElement,
  html,
  css,
} from "lit";

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
      columns: {
        Name: "attributes.metadata.name",
        Namespace: "attributes.metadata.namespace",
        State: "state"
      },
      filters: {
        "attributes.device_class": this.route.path.substring(1),
      }
    }
  }

  render() {
    return html`
    <ha-app-layout>
    <app-header fixed slot="header">
      <app-toolbar>
        <div><a href="${this.route.prefix}/Node">Nodes</a></div>
        <div><a href="${this.route.prefix}/Deployment">Deployments</a></div>
        <div><a href="${this.route.prefix}/DaemonSet">DaemonSets</a></div>
        <div><a href="${this.route.prefix}/Pod">Pods</a></div>
      </app-toolbar>
    </app-header>
    </ha-app-layout>

    <table-card
      .hass=${this.hass}
      .config=${this.getConfig()}
    ></table-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      app-toolbar {
        overflow: hidden;
        background-color: var(--app-header-background-color);
      }

      .topnav a {
        float: left;
        color: #f2f2f2;
        text-align: center;
        padding: 18px 16px;
        text-decoration: none;
        font-size: 17px;
      }

      .topnav a:hover {
        background-color: #ddd;
        color: black;
      }

      .topnav a.active {
        background-color: #04AA6D;
        color: white;
      }
    `;
  }
}

customElements.define("kubernetes-frontend", KubernetesPanel);