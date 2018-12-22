import { Block, createBlock, parse } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import { Bibliography, RebuildProcessorStateData } from 'citeproc';

import {
    getEditorDOM,
    mergeItems,
    parseBibliographyHTML,
    removeItems,
} from 'utils/editor';
import Processor from 'utils/processor';

import { Actions, StyleKind } from './constants';
import { fetchLocale, fetchStyle } from './controls';

export function* addReference(data: CSL.Data) {
    yield addReferences([data]);
}

export function* addReferences(data: CSL.Data[]) {
    yield {
        type: Actions.ADD_REFERENCES,
        data,
    };
    yield dispatch('core/editor').editPost(
        select('abt/data').getSerializedState(),
    );
    yield dispatch('core/editor').savePost();
}

export function* removeReference(id: string) {
    yield removeReferences([id]);
}

export function* removeReferences(itemIds: string[]) {
    const doc = getEditorDOM();
    const toDelete = removeItems(doc, itemIds);
    yield {
        type: Actions.REMOVE_REFERENCES,
        itemIds: toDelete,
    };
    if (toDelete.length !== itemIds.length) {
        yield dispatch('core/editor').resetBlocks(parse(doc.innerHTML));
    }
    yield dispatch('core/editor').editPost(
        select('abt/data').getSerializedState(),
    );
    yield dispatch('core/editor').savePost();
}

export function* updateReference(data: CSL.Data) {
    yield {
        type: Actions.UPDATE_REFERENCE,
        data,
    };
    yield parseCitations();
    yield dispatch('core/editor').editPost(
        select('abt/data').getSerializedState(),
    );
    yield dispatch('core/editor').savePost();
}

export function* removeAllCitations() {
    const doc = getEditorDOM();
    for (const el of doc.querySelectorAll('.abt-citation')) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
    yield dispatch('core/editor').resetBlocks(parse(doc.innerHTML));
}

export function* parseCitations() {
    const style = select('abt/data').getStyle();
    let styleXml: string;
    if (style.kind === StyleKind.CUSTOM) {
        throw new Error('Custom styles not implemented yet.');
    } else {
        styleXml = yield fetchStyle(style.value);
        yield fetchLocale(styleXml);
    }
    const processor = new Processor(styleXml);
    const citations = processor.parseCitations(
        select('abt/data').getCitationsByIndex(),
    );
    const bibliography = processor.makeBibliography();
    if (bibliography) {
        yield setBibliography(bibliography);
    }
    yield updateEditorCitations(citations);
}

// function receiveStyle(style: State['style']) {
//     return {
//         type: Actions.RECEIVE_STYLE,
//         style,
//     };
// }

function* setBibliography(bibliography: Bibliography) {
    const blocksList = select<Block[]>('core/editor').getBlocks();
    const bibliographyBlock = blocksList.find(
        block => block.name === 'abt/bibliography',
    );
    const content = parseBibliographyHTML(bibliography);
    if (content && bibliographyBlock) {
        yield dispatch('core/editor').updateBlockAttributes(
            bibliographyBlock.clientId,
            { content },
        );
    } else if (content && !bibliographyBlock) {
        yield dispatch('core/editor').insertBlock(
            createBlock('abt/bibliography', { content }),
            blocksList.length,
            undefined,
            true,
        );
    } else if (!content && bibliographyBlock) {
        yield dispatch('core/editor').removeBlock(bibliographyBlock.clientId);
    }
    return {
        type: Actions.SET_BIBLIOGRAPHY,
        bibliography,
    };
}

function* updateEditorCitations(citations: RebuildProcessorStateData[]) {
    const doc = getEditorDOM();
    for (const [id, , html] of citations) {
        const node = doc.querySelector<HTMLElement>(
            `.abt-citation[data-id="${id}"]`,
        );
        if (node) {
            // handle deprecation
            if (node.dataset.reflist) {
                node.dataset.items = mergeItems(
                    JSON.parse(node.dataset.reflist),
                    node.dataset.items,
                );
                delete node.dataset.reflist;
            }
            node.innerHTML = html;
        }
    }
    yield dispatch('core/editor').resetBlocks(parse(doc.innerHTML));
}

/*
TODO: Implement this
export function* updateStyle(style: State['style']) {
    let csl: string = '';
    if (style.kind === StyleKind.PREDEFINED) {
        csl = yield fetchStyle(style.value);
        // still need to figure out how to do this with predefined.
        yield fetchLocale(csl);
    }
    yield receiveStyle(style);
    // --> run a one-off command here to generate a processor, reparse the citations and bib, and exit
    // --> it should prob be its own internal action that can be shared because it will likely be
    // --> used when we insert citations as well.

    return {
        ...(csl ? { csl } : {}),
        style,
    };
}
*/
