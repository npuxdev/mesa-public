'use client';

import {createElement, type ReactNode} from 'react';
import parse, {
  Element,
  Text,
  attributesToProps,
  domToReact,
  type DOMNode,
  type HTMLReactParserOptions,
} from 'html-react-parser';

function optionLabel(node: Element): string {
  return node.children
    .map((child) => (child instanceof Text ? child.data : child instanceof Element ? optionLabel(child) : ''))
    .join('');
}

/**
 * Bridge for screen bodies still authored as HTML strings during the strangler migration.
 * Lifts legacy `selected` / `checked` attributes into React defaultValue / defaultChecked
 * so html-react-parser does not emit invalid controlled props.
 */
export function HtmlView({html}: {html: string}) {
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (!(domNode instanceof Element)) return;

      if (domNode.name === 'select') {
        const props = attributesToProps(domNode.attribs);
        let defaultValue: string | undefined;
        for (const child of domNode.children) {
          if (!(child instanceof Element) || child.name !== 'option') continue;
          if (!('selected' in child.attribs)) continue;
          defaultValue = child.attribs.value ?? optionLabel(child);
          delete child.attribs.selected;
        }
        if (defaultValue !== undefined && props.defaultValue === undefined && props.value === undefined) {
          props.defaultValue = defaultValue;
        }
        return createElement('select', props, domToReact(domNode.children as DOMNode[], options));
      }

      if (domNode.name === 'option' && 'selected' in domNode.attribs) {
        const props = attributesToProps(domNode.attribs);
        delete props.selected;
        return createElement('option', props, domToReact(domNode.children as DOMNode[], options));
      }

      if (domNode.name === 'input' && 'checked' in domNode.attribs) {
        const props = attributesToProps(domNode.attribs);
        delete props.checked;
        if (props.defaultChecked === undefined) props.defaultChecked = true;
        return createElement('input', props);
      }

      return undefined;
    },
  };

  return <>{parse(html, options) as ReactNode}</>;
}
