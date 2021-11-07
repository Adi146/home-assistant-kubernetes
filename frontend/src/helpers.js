import { html } from "lit";

export const stateError = "error";
export const stateWarning = "warning";
export const stateSuccess = "success";

export function getState(entity_row) {
  return entity_row.state;
}

export function getName(entity_row) {
  return entity_row.attributes.metadata.name;
}

export function getNamespace(entity_row) {
  return entity_row.attributes.metadata.namespace;
}

export function getConditions(entity_row, filter) {
  let conditions = entity_row.attributes.status.conditions;

  if (filter) {
    conditions = conditions.filter((condition) => {
      let condition_filter = filter[condition.type];
      let condition_state = getConditionStateMapper(condition);
      // prettier-ignore
      return (!condition_filter) ||
             (condition_filter == stateSuccess) ||
             (condition_filter == stateWarning && (condition_state == stateWarning || condition_state == stateError)) ||
             (condition_filter == stateError && condition_state == stateError)
    });
  }

  return conditions;
}

export function getNodeSchedulable(entity_row) {
  return !entity_row.attributes.spec.unschedulable;
}

export function getCreated(entity_row) {
  return new Date(entity_row.attributes.metadata.creation_timestamp);
}

export function getAge(entity_row) {
  return Date.now() - getCreated(entity_row);
}

export function getAgeStr(entity_row) {
  var ms = getAge(entity_row);
  var d = Math.floor(ms / 86400000);
  var h = Math.floor((ms / 3600000) % 24);

  return `${d}d${h}h`;
}

export function getNodeSchedulableIcon(entity_row) {
  if (getNodeSchedulable(entity_row)) {
    return html` <ha-icon class="success" icon="mdi:check"></ha-icon> `;
  } else {
    return html` <ha-icon class="warning" icon="mdi:close"></ha-icon> `;
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

  return (
    conditionStateMap[condition.type][condition.reason] ??
    conditionStateMap[condition.type][condition.status]
  );
}

export function getConditionsAsSpans(entity_row) {
  let conditions = getConditions(entity_row, this);

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

export function getConditionsStrings(entity_row) {
  let conditions = getConditions(entity_row, this);

  return `
    ${conditions.map((condition) => {
      return `
        ${condition.reason ? condition.reason : condition.type}
      `;
    })}
  `;
}

export function getNodeName(entity_row) {
  return entity_row.attributes.spec.node_name;
}

export function getDesiredReplicas(entity_row) {
  return (
    entity_row.attributes.status.replicas ??
    entity_row.attributes.status.desired_number_scheduled ??
    0
  );
}

export function getReadyReplicas(entity_row) {
  return (
    entity_row.attributes.status.ready_replicas ??
    entity_row.attributes.status.number_ready ??
    0
  );
}

export function getReplicaStr(entity_row) {
  return `${getReadyReplicas(entity_row)}/${getDesiredReplicas(entity_row)}`;
}
