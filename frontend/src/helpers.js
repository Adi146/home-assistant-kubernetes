import { html } from "lit";
import { state } from "lit-element";

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
  return entity_row.attributes.status.conditions;
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
    NetworkUnavailable: {
      True: stateError,
      False: stateSuccess,
    },
    MemoryPressure: {
      True: stateWarning,
      False: stateSuccess,
    },
    DiskPressure: {
      True: stateWarning,
      False: stateSuccess,
    },
    PIDPressure: {
      True: stateWarning,
      False: stateSuccess,
    },
    Ready: {
      True: stateSuccess,
      False: stateError,
      PodCompleted: stateSuccess,
    },
    Available: {
      True: stateSuccess,
      False: stateError,
    },
    Progressing: {
      True: stateSuccess,
      False: stateError,
    },
    Initialized: {
      True: stateSuccess,
      False: stateError,
    },
    ContainersReady: {
      True: stateSuccess,
      False: stateError,
      PodCompleted: stateSuccess,
    },
    PodScheduled: {
      True: stateSuccess,
      False: stateError,
    },
  };

  return conditionStateMap[condition.type][condition.reason] ?? conditionStateMap[condition.type][condition.status];
}

export function getConditionsAsSpans(conditions) {
  return html`
    ${conditions.map((condition) => {
      return html`
        <span class="condition ${getConditionStateMapper(condition)}">
          ${condition.reason ? condition.reason : condition.type}
        </span>
      `;
    })}
  `;
}
