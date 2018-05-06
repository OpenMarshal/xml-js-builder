import { XMLElement } from './XMLElement'
import { XML } from './XML'

function explodeName(name : string, attributes : { [name : string] : string }, findNamespaceInParents : (ns : string) => string) : string
{
    const li1 = name.lastIndexOf(':');
    const li2 = name.indexOf(':');
    
    if(li1 === -1)
        return name;

    var leftName = name.substring(0, li1);
    var rightName = name.substring(li1 + 1);

    var namespace = attributes['xmlns:' + leftName];
    if(namespace)
    {
        return name;
    }

    if(findNamespaceInParents(leftName))
        return name;

    var kname = 'a';
    var value = leftName + ':';
    while (attributes['xmlns:' + kname] !== undefined || value.indexOf(kname + ':') === 0) {
        var newChar = kname.charCodeAt(0) + 1;
        if (newChar > 'z'.charCodeAt(0))
            kname = 'x' + String.fromCharCode(newChar);
        else
            kname = kname.substr(0, kname.length - 1) + String.fromCharCode(newChar);
    }
    attributes['xmlns:' + kname] = value;
    name = kname + ':' + rightName;
    
    return name;

    /*
    const lindex = Math.max(li1 === li2 && name.indexOf('DAV:') !== 0 ? -1 : li1, name.lastIndexOf('/')) + 1;
    if(lindex !== 0)
    {
        let kname = 'a';
        const value = name.substring(0, lindex);
        while(attributes['xmlns:' + kname] !== undefined || value.indexOf(kname + ':') === 0)
        {
            const newChar = kname.charCodeAt(0) + 1;
            if(newChar > 'z'.charCodeAt(0))
                kname = 'x' + String.fromCharCode(newChar);
            else
                kname = kname.substr(0, kname.length - 1) + String.fromCharCode(newChar);
        }
        attributes['xmlns:' + kname] = value;
        name = kname + ':' + name.substring(lindex);
    }

    return name;*/
}

export class XMLElementBuilder implements XMLElement
{
    type : string
    name : string
    attributes : {
        [name : string] : string
    }
    elements : XMLElementBuilder[]
    parent : XMLElementBuilder

    constructor(name : string, attributes ?: any, parent ?: XMLElementBuilder)
    {
        if(!attributes)
            attributes = {};
        
        this.parent = parent;
        this.name = explodeName(name, attributes, XMLElementBuilder.exportFindNamespace(parent));
        this.type = 'element';
        this.attributes = attributes;
        this.elements = [];
    }

    toXML(includeDeclaration ?: boolean) : string
    {
        return XML.toXML(this, includeDeclaration);
    }
    toJSON(includeDeclaration ?: boolean) : string
    {
        return XML.toJSON(this.toXML(includeDeclaration));
    }

    ele(name : string, attributes ?: any, insertAtStart ?: boolean) : XMLElementBuilder
    {
        const el = new XMLElementBuilder(name, attributes, this);
        if(insertAtStart)
            this.elements.unshift(el);
        else
            this.elements.push(el);
        return el;
    }
    
    findNamespace(namespace : string) : string
    {
        if(this.attributes['xmlns:' + namespace])
            return this.attributes['xmlns:' + namespace];

        if(!this.parent)
            return undefined;

        return this.parent.findNamespace(namespace);
    }

    protected static exportFindNamespace(element : XMLElementBuilder)
    {
        if(!element || !element.findNamespace)
            return () => {
                return undefined;
            };

        return (ns : string) => {
            return element.findNamespace(ns);
        };
    }

    add<T>(element : any[]) : T[]
    add<T>(element : any) : T
    add<T>(element : any) : T | T[]
    {
        if(element.constructor === Array)
            return (element as any[]).map(this.add.bind(this) as (element : any) => T);
        
        if(!element.type)
            element = {
                type: 'text',
                text: element.toString()
            };
        
        if(element.type === 'element')
        {
            if(!element.attributes)
                element.attributes = { };
            
            element.name = explodeName(element.name, element.attributes, XMLElementBuilder.exportFindNamespace(this));
            
            if(element.elements)
            {
                const list = [];
                element.elements.forEach((e) => list.push(e));

                while(list.length > 0)
                {
                    const current = list.shift();
                    if(current.type !== 'element')
                        continue;
                        
                    if(current.elements)
                        current.elements.forEach((e) => list.push(e));

                    if(!current.attributes)
                        current.attributes = {};
                    current.name = explodeName(current.name, current.attributes, XMLElementBuilder.exportFindNamespace(this));
                }
            }
        }
        
        element.parent = this;
        this.elements.push(element);
        return element;
    }
}
