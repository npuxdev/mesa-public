'use client';

import type {ReactNode} from 'react';
import {ActionButton, PageHeading, titleCase} from './ui';

export function WorkflowHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return <PageHeading title={title} subtitle={subtitle} actions={actions} />;
}

export function WorkflowForm({
  command,
  resourceId,
  version,
  label = 'Save changes',
  extra = {},
  children,
}: {
  command: string;
  resourceId: string;
  version?: number;
  label?: string;
  extra?: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <form
      className="panel panel-body workflow-form"
      data-command={command}
      data-resource={resourceId}
      {...(version === undefined ? {} : {'data-version': String(version)})}
      {...extra}
    >
      <div className="form-error" role="alert" />
      <div className="form-stack">{children}</div>
      <div className="form-actions">
        <span className="meta" data-save-status role="status" />
        <button className="btn primary" type="submit">
          {label}
        </button>
      </div>
    </form>
  );
}

export function WorkflowAction({
  text,
  type,
  id,
  payload = {},
  confirm = '',
  version,
}: {
  text: string;
  type: string;
  id: string;
  payload?: Record<string, unknown>;
  confirm?: string;
  version?: number;
}) {
  const extra: Record<string, string> = {
    'data-command': type,
    'data-id': id,
    'data-payload': JSON.stringify(payload),
  };
  if (confirm) extra['data-confirm'] = confirm;
  if (version !== undefined) extra['data-version'] = String(version);
  return <ActionButton text={text} action="workflow-command" variant="secondary" extra={extra} />;
}

export function Hidden({name, value}: {name: string; value: string}) {
  return <input type="hidden" name={name} value={value} />;
}

export function SelectField({
  name,
  label,
  options,
  selected = '',
  help = '',
}: {
  name: string;
  label: string;
  options: {id: string; name: string}[];
  selected?: string;
  help?: string;
}) {
  const optional = options.some((o) => o.id === '');
  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>
        {label}
        {optional ? null : (
          <>
            {' '}
            <abbr className="required-marker" title="Required" aria-label="Required">
              *
            </abbr>
          </>
        )}
      </label>
      <select id={`field-${name}`} name={name} required={!optional} defaultValue={selected}>
        {options.map((o) => (
          <option key={o.id || o.name} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {help ? <small>{help}</small> : null}
    </div>
  );
}

export {titleCase};
