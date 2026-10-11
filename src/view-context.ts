import type {FixtureData, Scope, ScreenDefinition, CommandReceipt} from './contracts.js';
import {routeTo} from './routes.js';
export type ViewContext = {data:FixtureData;scope:Scope;screen:ScreenDefinition;params:Record<string,string>;query:URLSearchParams;receipt:CommandReceipt|null;result:string;error:string};
export function href(c:ViewContext,id:string,params:Record<string,string>={},query:Record<string,string>={}):string{return routeTo(id,{...c.params,orgSlug:c.scope.tenant,...params},query);}
export const value = (c:ViewContext,key:string,fallback='') => c.query.get(key)||fallback;
