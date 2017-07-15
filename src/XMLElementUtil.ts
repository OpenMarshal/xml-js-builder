import { XMLElement } from './XMLElement'

function seekForNS(node : any, parentNS : any) : any
{
    if(!node.attributes)
        return parentNS;
    
    const ns : any = {};
    for(const name in parentNS)
        ns[name] = parentNS[name];

    for(const name in node.attributes)
    {
        if(name.indexOf('xmlns:') === 0 || name === 'xmlns')
        {
            const value = node.attributes[name];
            if(name === 'xmlns')
                ns._default = value;
            else
                ns[name.substring('xmlns:'.length)] = value;
        }
    }
    return ns;
}

export function mutateNodeNS(node : XMLElement, parentNS ?: { [name : string] : string }) : XMLElementUtil
export function mutateNodeNS(node : any, parentNS: { [name : string] : string } = { }) : XMLElementUtil
{
    if(!node)
        return undefined;
    if(node.find)
        return node as XMLElementUtil;
    
    const nss = seekForNS(node, parentNS);

    if(node.name)
    {
        for(const ns in nss)
        {
            if(ns === '_default' && node.name.indexOf(':') === -1)
            {
                node.name = nss[ns] + node.name;
                break;
            }
            else if(node.name.indexOf(ns + ':') === 0)
            {
                node.name = nss[ns] + node.name.substring((ns + ':').length);
                break;
            }
        }
    }

    node.findIndex = function(name : string) : number
    {
        for(let index = 0; index < node.elements.length; ++index)
            if(node.elements[index] && node.elements[index].name && node.elements[index].name === name)
                return index;
        return -1;
    }
    node.find = function(name : string) : XMLElement
    {
        for(const element of node.elements)
            if(element && element.name && element.name === name)
                return element;
        throw new Error('Cannot find the XML element : ' + name);
    }
    node.findMany = function(name : string) : XMLElement[]
    {
        const elements : XMLElement[] = [];

        for(const element of node.elements)
            if(element && element.name && element.name === name)
                elements.push(element);
        
        return elements;
    }
    node.findText = function() : string
    {
        for(const element of node.elements)
            if(element && element.type === 'text')
                return element.text;
        return '';
    }
    node.findTexts = function() : string[]
    {
        const texts = [];

        for(const element of node.elements)
            if(element && element.type === 'text')
                texts.push(element.text);
        
        return texts;
    }
    
    if(node.elements)
        node.elements.forEach(n => mutateNodeNS(n, nss))
    else
        node.elements = [];
    return node as XMLElementUtil;
}

export interface XMLElementUtil extends XMLElement
{
    declaration ?: any
    attributes : any
    elements : XMLElementUtil[]
    name : string
    type : string

    findIndex(name : string) : number
    find(name : string) : XMLElementUtil
    findMany(name : string) : XMLElementUtil[]
    findText() : string
    findTexts() : string[]
}
