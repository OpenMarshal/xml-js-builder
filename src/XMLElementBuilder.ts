import { XMLElement } from './XMLElement'
import { XML } from './XML'

function explodeName(name : string, attributes : { [name : string] : string }) : string
{
    const li1 = name.lastIndexOf(':');
    const li2 = name.indexOf(':');
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

    return name;
}

export class XMLElementBuilder implements XMLElement
{
    type : string
    name : string
    attributes : {
        [name : string] : string
    }
    elements : XMLElementBuilder[]

    constructor(name : string, attributes ?: any)
    {
        if(!attributes)
            attributes = {};
        
        this.name = explodeName(name, attributes);
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
        const el = new XMLElementBuilder(name, attributes);
        if(insertAtStart)
            this.elements.unshift(el);
        else
            this.elements.push(el);
        return el;
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
            
            element.name = explodeName(element.name, element.attributes);
            
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
                    current.name = explodeName(current.name, current.attributes);
                }
            }
        }
        
        this.elements.push(element);
        return element;
    }
}
