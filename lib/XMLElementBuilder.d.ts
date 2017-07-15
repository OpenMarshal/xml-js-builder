import { XMLElement } from './XMLElement';
export declare class XMLElementBuilder implements XMLElement {
    type: string;
    name: string;
    attributes: {
        [name: string]: string;
    };
    elements: XMLElementBuilder[];
    constructor(name: string, attributes?: any);
    toXML(includeDeclaration?: boolean): string;
    toJSON(includeDeclaration?: boolean): string;
    ele(name: string, attributes?: any, insertAtStart?: boolean): XMLElementBuilder;
    add<T>(element: any[]): T[];
    add<T>(element: any): T;
}
