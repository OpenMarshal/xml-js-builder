"use strict";

const xmljs = require('../lib/exports');

function success(text)
{
    return ' \x1b[42m\x1b[37m\x1b[1m o \x1b[0m ' + text + '\x1b[0m';
}
function error(text)
{
    return ' \x1b[41m\x1b[37m\x1b[1m o \x1b[0m ' + text + '\x1b[0m';
}

function sectors()
{
    const reuslt = {
        nbErrors: 0,
        sector(name, action)
        {
            try
            {
                action();
                console.error(success(name));
            }
            catch(ex)
            {
                ++reuslt.nbErrors;
                console.error(error(name + ' ' + ex));
            }
        },
        sectorE(name, action, next)
        {
            try
            {
                action();
                ++reuslt.nbErrors;
                console.error(error(name + ' must have fail'));
            }
            catch(ex)
            {
                console.error(success(name));
                next();
            }
        }
    };
    return reuslt;
}

const xml = '<d:multistatus xmlns:d="DAV:" xmlns:x="ok:"><d:deep xmlns="ttt:"><test></test></d:deep><d:node2>Ok1</d:node2><d:node2>Ok2</d:node2><d:tag/><x:test></x:test><nons>yes</nons><d:node2>Ok3</d:node2></d:multistatus>'
const jsonCompact = JSON.stringify({
    'd:multistatus': {
        _attributes: {
            'xmlns:d': 'DAV:',
            'xmlns:x': 'ok:'
        },
        'd:deep': {
            _attributes: {
                'xmlns': 'ttt:'
            },
            'test': {}
        },
        'd:node2': [
            {
                _text: 'Ok1'
            },
            {
                _text: 'Ok2'
            },
            {
                _text: 'Ok3'
            }
        ],
        'd:tag': {},
        'x:test': {},
        'nons': {
            _text: 'yes'
        }
    }
})
const jsonExtended = JSON.stringify({
    elements: [
        {
            name: 'd:multistatus',
            type: 'element',
            attributes: {
                'xmlns:d': 'DAV:',
                'xmlns:x': 'ok:'
            },
            elements: [
                {
                    name: 'd:deep',
                    type: 'element',
                    attributes: {
                        'xmlns': 'ttt:'
                    },
                    elements: [
                        {
                            name: 'test',
                            type: 'element'
                        }
                    ]
                },
                {
                    name: 'd:node2',
                    type: 'element',
                    elements: [{
                        type: 'text',
                        text: 'Ok1'
                    }]
                },
                {
                    name: 'd:node2',
                    type: 'element',
                    elements: [{
                        type: 'text',
                        text: 'Ok2'
                    }]
                },
                {
                    name: 'd:tag',
                    type: 'element'
                },
                {
                    name: 'x:test',
                    type: 'element'
                },
                {
                    name: 'nons',
                    type: 'element',
                    elements: [{
                        type: 'text',
                        text: 'yes'
                    }]
                },
                {
                    name: 'd:node2',
                    type: 'element',
                    elements: [{
                        type: 'text',
                        text: 'Ok3'
                    }]
                }
            ]
        }
    ]
})

function test(name, value)
{
    const sep = name.length % 2 === 1 ? '=============================================' : '==============================================';
    name = '  ' + name + '  ';
    while(name.length < sep.length)
        name = '=' + name + '=';
    console.log(sep);
    console.log(name);
    console.log(sep);
    
    const parsed = xmljs.XML.parse(value);

    const sect = sectors();
    const sector = sect.sector;
    const sectorE = sect.sectorE;

    sector('Seek for "DAV:multistatus"', () => {
        const mulstistatus = parsed.find('DAV:multistatus')
        sector('Seek for "DAV:deep"', () => {
            const deep = mulstistatus.find('DAV:deep')
            sector('Seek for "ttt:test"', () => {
                const test = deep.find('ttt:test')
            })
        })
        sector('Seek for "DAV:tag"', () => {
            const tag = mulstistatus.find('DAV:tag')
        })
        sector('Seek for "ok:test"', () => {
            const test = mulstistatus.find('ok:test')
        })
        sector('Seek for "nons"', () => {
            const nons = mulstistatus.find('nons')
            sector('Seek for text of "nons"', () => {
                const text = nons.findText()
                if(text !== 'yes')
                    throw new Error('Wrong text value : ' + text);
            })
        })
        sector('Seek for many "DAV:node2"', () => {
            const nodes2 = mulstistatus.findMany('DAV:node2');
            if(nodes2.length !== 3)
                throw new Error('Wrong number of nodes provided by "findMany(...)" : ' + nodes2.length);
        })
    })

    if(value.constructor === String)
    {
        sector('Check namespaces', () => {
            sector('Check for namespace with LCGDM:mode', () => {
                if(value.indexOf('LCGDM:mode') !== -1)
                    throw new Error('Namespace not pushed in the attributes');
            })
        })
    }

    if(sect.nbErrors === 0)
        console.log(' Passed!');
    else
    {
        console.log(' ' + sect.nbErrors + ' error(s) occured!');
        process.exitCode = 1;
    }
    console.log();
}

test('XML', xml);
test('JSON Compact', jsonCompact);
test('JSON Extended', jsonExtended);

{
    const xml = new xmljs.XMLElementBuilder('d:multistatus', {
        'xmlns:d': 'DAV:',
        'xmlns:x': 'ok:'
    });
    xml.ele('d:deep', {
        'xmlns': 'ttt:'
    }).ele('test');
    xml.ele('d:node2').add('Ok1')
    xml.ele('d:node2').add('Ok2')
    xml.ele('d:tag')
    xml.ele('x:test')
    xml.add({
        type: 'element',
        name: 'LCGDM:mode'
    })
    xml.ele('nons').add('yes')
    xml.ele('d:node2').add('Ok3')
    
    test('XML Builder (XML string)', xml.toXML());
    test('XML Builder (JSON string)', xml.toJSON());
}
