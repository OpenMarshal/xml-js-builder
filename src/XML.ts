import { XMLElementUtil, mutateNodeNS } from './XMLElementUtil'
import { XMLElement } from './XMLElement'
import * as xmljs from 'xml-js'

export abstract class XML
{
    static parse(xml : string | Int8Array) : XMLElementUtil
    {
        try
        {
            return XML.parseXML(xml);
        }
        catch(_)
        {
            try
            {
                const data = JSON.parse(xml.toString());
                if(data.elements && data.elements[0].type && data.elements[0].name)
                    return XML.parseJSON(xml, false);
            }
            catch(_)
            { }

            try
            {
                return XML.parseJSON(xml, true);
            }
            catch(_)
            {
                return XML.parseJSON(xml, false);
            }
        }
    }

    static parseJSON(xml : string | Int8Array, compact : boolean = true) : XMLElementUtil
    {
        return XML.parseXML(xmljs.json2xml(xml.toString(), { compact }));
    }

    static parseXML(xml : string | Int8Array) : XMLElementUtil
    {
        const x : XMLElement = xmljs.xml2js(xml.constructor === String ? xml as string : new Buffer(xml as Int8Array).toString(), {
            compact: false
        });

        return mutateNodeNS(x);
    }

    static toJSON(xml : string) : string
    {
        if(xml === undefined || xml === null)
            return xml;
        if(xml.constructor === Number || xml.constructor === Boolean)
            return xml.toString();

        return xmljs.xml2json(xml, { compact: true, alwaysArray: true });
    }

    static toXML(xml : XMLElement | any, includeDeclaration : boolean = true) : string
    {
        let finalXml : any = xml;

        if(includeDeclaration && !xml.declaration)
            finalXml = {
                declaration: {
                    attributes: {
                        version: '1.0',
                        encoding: 'utf-8'
                    }
                },
                elements: [
                    xml
                ]
            };

        return xmljs.js2xml(finalXml, {
            compact: false
        });
    }/*

    private static explodeName(name, attributes)
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

    static createElement(name : string, attributes ?: any, text ?: string)
    {
        if(!attributes)
            attributes = {};
        
        name = XML.explodeName(name, attributes);

        const result = {
            type: 'element',
            name,
            attributes,
            elements: [],
            ele(name : string, attributes ?: any, insertAtStart ?: boolean)
            {
                const el = result.eleFn(name, attributes);
                if(insertAtStart)
                    result.elements.unshift(el);
                else
                    result.elements.push(el);
                return el;
            },
            add(element : any)
            {
                if(element.constructor === String || element.constructor === Number || element.constructor === Boolean)
                    element = {
                        type: 'text',
                        text: element.toString()
                    };
                
                if(element.type === 'element')
                {
                    if(!element.attributes)
                        element.attributes = { };
                    
                    element.name = XML.explodeName(element.name, element.attributes);
                    
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
                            current.name = XML.explodeName(current.name, current.attributes);
                        }
                    }
                }
                
                if(element.constructor === Array)
                    (element as any).forEach(result.add);
                else
                    result.elements.push(element);
                return element;
            },
            eleFn: XML.createElement
        }

        return result;
    }*/
}
