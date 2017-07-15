"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XML_1 = require("./XML");
function explodeName(name, attributes) {
    var li1 = name.lastIndexOf(':');
    var li2 = name.indexOf(':');
    var lindex = Math.max(li1 === li2 && name.indexOf('DAV:') !== 0 ? -1 : li1, name.lastIndexOf('/')) + 1;
    if (lindex !== 0) {
        var kname = 'a';
        var value = name.substring(0, lindex);
        while (attributes['xmlns:' + kname] !== undefined || value.indexOf(kname + ':') === 0) {
            var newChar = kname.charCodeAt(0) + 1;
            if (newChar > 'z'.charCodeAt(0))
                kname = 'x' + String.fromCharCode(newChar);
            else
                kname = kname.substr(0, kname.length - 1) + String.fromCharCode(newChar);
        }
        attributes['xmlns:' + kname] = value;
        name = kname + ':' + name.substring(lindex);
    }
    return name;
}
var XMLElementBuilder = (function () {
    function XMLElementBuilder(name, attributes) {
        if (!attributes)
            attributes = {};
        this.name = explodeName(name, attributes);
        this.type = 'element';
        this.attributes = attributes;
        this.elements = [];
    }
    XMLElementBuilder.prototype.toXML = function (includeDeclaration) {
        return XML_1.XML.toXML(this, includeDeclaration);
    };
    XMLElementBuilder.prototype.toJSON = function (includeDeclaration) {
        return XML_1.XML.toJSON(this.toXML(includeDeclaration));
    };
    XMLElementBuilder.prototype.ele = function (name, attributes, insertAtStart) {
        var el = new XMLElementBuilder(name, attributes);
        if (insertAtStart)
            this.elements.unshift(el);
        else
            this.elements.push(el);
        return el;
    };
    XMLElementBuilder.prototype.add = function (element) {
        if (element.constructor === Array)
            return element.map(this.add.bind(this));
        if (!element.type)
            element = {
                type: 'text',
                text: element.toString()
            };
        if (element.type === 'element') {
            if (!element.attributes)
                element.attributes = {};
            element.name = explodeName(element.name, element.attributes);
            if (element.elements) {
                var list_1 = [];
                element.elements.forEach(function (e) { return list_1.push(e); });
                while (list_1.length > 0) {
                    var current = list_1.shift();
                    if (current.type !== 'element')
                        continue;
                    if (current.elements)
                        current.elements.forEach(function (e) { return list_1.push(e); });
                    if (!current.attributes)
                        current.attributes = {};
                    current.name = explodeName(current.name, current.attributes);
                }
            }
        }
        this.elements.push(element);
        return element;
    };
    return XMLElementBuilder;
}());
exports.XMLElementBuilder = XMLElementBuilder;
