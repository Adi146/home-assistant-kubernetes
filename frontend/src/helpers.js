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

export function getConditions(entity_row) {
  var conditions = [];
  for (const condition of entity_row.attributes.status.conditions) {
    if (condition.status === "True") {
      conditions.push(condition.type);
    }
  }

  return conditions;
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

export function getConditionStateMapper(condition) {
  var conditionStateMap = {
    NetworkUnavailable: stateError,
    MemoryPressure: stateWarning,
    DiskPressure: stateWarning,
    PIDPressure: stateWarning,
    Ready: stateSuccess,
    Available: stateSuccess,
    Progressing: stateSuccess,
  };

  return conditionStateMap[condition];
}

export function getConditionsAsSpans(array) {
  return html`
    ${array.map((value) => {
      return html`
        <span class="${getConditionStateMapper(value)}">${value}</span>
      `;
    })}
  `;
}
