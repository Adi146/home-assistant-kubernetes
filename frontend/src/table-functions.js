import { html } from "lit";

const stateError = "error";
const stateWarning = "warning";
const stateSuccess = "success";

export function getName(entity_row) {
  return entity_row.attributes.metadata.name;
}

export function getNamespace(entity_row) {
  return entity_row.attributes.metadata.namespace;
}

export function getNodeConditions(entity_row) {
  var status = [];
  for (const condition of entity_row.attributes.status.conditions) {
    if (condition.status === "True") {
      status.push(condition.type);
    }
  }
  return status.join(", ");
}

export function getNodeConditionsStateClass(entity_row) {
  var status = [];
  for (const condition of entity_row.attributes.status.conditions) {
    if (condition.status === "True") {
      status.push(condition.type);
    }
  }

  if (status.includes("Ready")) {
    if (status.length == 1) {
      return stateSuccess;
    } else {
      return stateWarning;
    }
  }
  return stateError;
}

export function getNodeSchedulable(entity_row) {
  return !entity_row.attributes.spec.unschedulable;
}

export function getNodeSchedulableIcon(value) {
  if (value) {
    return html` <ha-icon icon="mdi:check"></ha-icon> `;
  } else {
    return html` <ha-icon icon="mdi:close"></ha-icon> `;
  }
}

export function getNodeSchedulableStateClass(entity_row) {
  if (getNodeSchedulable(entity_row)) {
    return stateSuccess;
  } else {
    return stateError;
  }
}
