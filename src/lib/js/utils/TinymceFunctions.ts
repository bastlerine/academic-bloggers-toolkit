declare const ABT_wp: BackendGlobals.ABT_wp;

/**
 * Opens `reference-window.tsx` and returns a promise which resolves to either
 *   `ABT.ReferenceWindowPayload` or `null` on close.
 * @param editor   The active TinyMCE instance.
 * @return A Promise which resolves to ABT.ReferenceWindowPayload
 */
export function referenceWindow(
    editor: TinyMCE.Editor
): Promise<ABT.ReferenceWindowPayload> {
    return new Promise((resolve, reject) => {
        editor.windowManager.open({
            height: 10,
            onclose: e => {
                if (!e.target.params.data) reject(null);
                resolve(<ABT.ReferenceWindowPayload>e.target.params.data);
            },
            params: {
                baseUrl: `${ABT_wp.abt_url}/lib/js/tinymce/views/`,
            },
            title: top.ABT_i18n.tinymce.referenceWindow.referenceWindow.title,
            url: `${ABT_wp.abt_url}/lib/js/tinymce/views/reference-window.html`,
            width: 600,
        });
    });
}

/**
 * Opens `import-window.tsx` and returns a promise which resolves to
 *   `CSL.Data[]` or `null` on close
 * @param  editor The active TinyMCE instance.
 * @return A Promise which resolves to CSL.Data[]
 */
export function importWindow(editor: TinyMCE.Editor): Promise<CSL.Data[]> {
    return new Promise((resolve, reject) => {
        editor.windowManager.open({
            height: 10,
            onclose: e => {
                if (!e.target.params.data) reject(null);
                resolve(<CSL.Data[]>e.target.params.data);
            },
            title: top.ABT_i18n.tinymce.importWindow.title,
            url: `${ABT_wp.abt_url}/lib/js/tinymce/views/import-window.html`,
            width: 600,
        });
    });
}

export function editReferenceWindow(
    editor: TinyMCE.Editor,
    ref: CSL.Data
): Promise<ABT.ManualData> {
    return new Promise((resolve, reject) => {
        editor.windowManager.open({
            height: 10,
            onclose: e => {
                if (!e.target.params.data) reject(null);
                resolve(<ABT.ManualData>e.target.params.data);
            },
            params: {
                reference: ref,
            },
            title: top.ABT_i18n.tinymce.editReferenceWindow.title,
            url: `${ABT_wp.abt_url}/lib/js/tinymce/views/edit-reference-window.html`,
            width: 600,
        });
    });
}

interface CitationPositions {
    /** The index of the HTMLSpanElement being inserted */
    currentIndex: number;
    locations: [Citeproc.CitationsPrePost, Citeproc.CitationsPrePost];
}
/**
 * Iterates the active TinyMCE instance and obtains the citations that come both
 *   before and after the inline citation being inserted currently. Also receives
 *   the index of the current citation within the document (ie, if there's one
 *   citation before and one citation after the current citation, `currentIndex`
 *   will be 1).
 * @param editor The active TinyMCE instance.
 * @param {string[]} validIds  Array of valid HTMLSpanElement IDs (citationById keys)
 * @return Parsed citation data.
 */
export function getRelativeCitationPositions(
    editor: TinyMCE.Editor,
    validIds: string[]
): CitationPositions {
    const doc = editor.getDoc();
    const currentSelection = editor.selection.getContent({ format: 'html' });
    const re = /<span id="([\d\w]+)" class="(?:abt-citation|abt_cite) .+<\/span>/;
    const id = (currentSelection.match(re) || ['', 'CURSOR'])[1];

    if (id === 'CURSOR') {
        editor.selection.setContent(
            `<span id="CURSOR" class="abt-citation"></span>`
        );
    }

    // TinyMCE creates a hidden duplicate of selections - this selector ensures
    // that we do not include that.
    const citations = doc.querySelectorAll(`
        *:not(.mce-offscreen-selection) >
            .abt-citation:not(.abt-citation_broken),
            .abt_cite:not(.abt-citation_broken)
    `);
    const payload: CitationPositions = {
        currentIndex: 0,
        locations: [[], []],
    };

    if (citations.length > 1) {
        let key = 0;
        Array.from(citations).forEach((el, i) => {
            if (el.id === id) {
                key = 1;
                payload.currentIndex = i;
                return;
            }
            if (el.id === '' || validIds.indexOf(el.id) === -1) {
                el.classList.add('abt-citation_broken');
                el.innerHTML = `${top.ABT_i18n.errors.broken} ${el.innerHTML}`;
                return;
            }
            payload.locations[key].push([el.id, i - key]);
        });
    }
    const el = editor.dom.doc.getElementById('CURSOR');
    if (el) el.parentElement!.removeChild(el);
    return payload;
}

/**
 * Updates the editor with inline citation data (citation clusters) generated
 *   by the processor.
 *
 * @param  editor   Active TinyMCE editor.
 * @param  clusters Citeproc.CitationClusterData[] generated by the processor.
 * @param  citationByIndex CitationByIndex data used to generate data attributes.
 * @param  xclass   Type of citation (full-note style or in-text style).
 * @return Promise which acts as a semaphore for the bibliography parser.
 */
export function parseInlineCitations(
    editor: TinyMCE.Editor,
    clusters: Citeproc.CitationClusterData[],
    citationByIndex: Citeproc.CitationByIndex,
    xclass: 'in-text' | 'note'
): Promise<boolean> {
    return xclass === 'note'
        ? parseFootnoteCitations(editor, clusters, citationByIndex)
        : parseInTextCitations(editor, clusters, citationByIndex);
}

function parseFootnoteCitations(
    editor: TinyMCE.Editor,
    clusters: Citeproc.CitationClusterData[],
    citationByIndex: Citeproc.CitationByIndex
): Promise<boolean> {
    return new Promise(resolve => {
        const doc = editor.getDoc();
        const existingNote = doc.getElementById('abt-footnote');
        const existingBib = doc.querySelector(
            '#abt-bibliography, #abt-smart-bib'
        );

        if (existingNote) existingNote.parentElement!.removeChild(existingNote);
        if (existingBib) existingBib.parentElement!.removeChild(existingBib);
        if (clusters.length === 0) return resolve(true);

        for (const [index, footnote, elementID] of clusters) {
            const inlineText = `[${index + 1}]`;
            const citation: HTMLSpanElement = doc.getElementById(elementID)!;
            const sortedItems: Citeproc.SortedItems =
                citationByIndex[index].sortedItems!;
            const idList: string = JSON.stringify(
                sortedItems.map(c => c[1].id)
            );

            if (!citation) {
                editor.selection.setContent(
                    `<span
                        id='${elementID}'
                        data-reflist='${idList}'
                        data-footnote='${footnote}'
                        class='abt-citation noselect mceNonEditable'
                    >
                        ${inlineText}
                    </span>`
                );
                continue;
            }
            citation.innerHTML = inlineText;
            citation.dataset['reflist'] = idList;
            citation.dataset['footnote'] = footnote;
        }

        const bm = editor.selection.getBookmark();

        const note = editor.dom.create<HTMLDivElement>('div', {
            class: 'abt-footnote noselect mceNonEditable',
            id: 'abt-footnote',
        });
        const heading = editor.dom.create<HTMLDivElement>(
            'div',
            {
                class: 'abt-footnote__heading',
            },
            top.ABT_i18n.misc.footnotes
        );

        note.appendChild(heading);

        const citations = <NodeListOf<HTMLSpanElement>>doc.querySelectorAll(
            '.abt-citation, .abt_cite'
        );
        Array.from(citations).forEach((c, i) => {
            c.innerText = `[${i + 1}]`;
            const noteItem = editor.dom.create<HTMLDivElement>(
                'div',
                {
                    class: 'abt-footnote__item',
                },
                `<span class="abt-footnote__number">[${i + 1}]</span>` +
                    `<span class="abt-footnote__content">${c.dataset[
                        'footnote'
                    ]}</span>`
            );
            note.appendChild(noteItem);
        });
        editor.getBody().appendChild(note);

        while (
            note.previousElementSibling &&
            note.previousElementSibling.childNodes.length === 1 &&
            note.previousElementSibling.childNodes[0].nodeName === 'BR'
        ) {
            const p = note.previousElementSibling;
            p.parentNode!.removeChild(p);
        }
        editor.setContent(editor.getBody().innerHTML);
        editor.selection.moveToBookmark(bm);

        return resolve(true);
    });
}

function parseInTextCitations(
    editor: TinyMCE.Editor,
    clusters: Citeproc.CitationClusterData[],
    citationByIndex: Citeproc.CitationByIndex
): Promise<boolean> {
    return new Promise(resolve => {
        const doc = editor.dom.doc;
        const existingNote = doc.getElementById('abt-footnote');
        if (existingNote) existingNote.parentElement!.removeChild(existingNote);

        for (const [index, inlineText, elementID] of clusters) {
            const citation: HTMLSpanElement = editor.dom.doc.getElementById(
                elementID
            )!;
            const sortedItems: Citeproc.SortedItems =
                citationByIndex[index].sortedItems!;
            const idList: string = JSON.stringify(
                sortedItems.map(c => c[1].id)
            );

            if (!citation) {
                editor.selection.setContent(
                    `<span
                        id='${elementID}'
                        data-reflist='${idList}'
                        class='abt-citation noselect mceNonEditable'
                    >
                        ${inlineText}
                    </span>`
                );
                continue;
            }
            citation.innerHTML = inlineText;
            citation.dataset['reflist'] = idList;
        }
        resolve(true);
    });
}

/**
 * Replaces the current bibliography, or creates a new one if one doesn't exist
 * @param editor       Active TinyMCE editor.
 * @param bibliography Bibliography array or `false` if current style doesn't
 *                                    produce a bibliography.
 * @param options      Bibliography options
 */
export function setBibliography(
    editor: TinyMCE.Editor,
    bibliography: ABT.Bibliography | boolean,
    options: {
        heading: string;
        headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        style: 'fixed' | 'toggle';
    }
): void {
    const doc = editor.getDoc();
    const existingBib = doc.querySelector('#abt-bibliography, #abt-smart-bib');
    if (existingBib) existingBib.parentElement!.removeChild(existingBib);

    if (typeof bibliography === 'boolean') return;

    const bm = editor.selection.getBookmark();

    const bib = editor.dom.create<HTMLDivElement>('div', {
        class: 'abt-bibliography noselect mceNonEditable',
        id: 'abt-bibliography',
    });

    const container = editor.dom.create<HTMLDivElement>('div', {
        class: 'abt-bibliography__container',
        id: 'abt-bibliography__container',
    });

    if (options.heading) {
        const heading = editor.dom.create<
            HTMLHeadingElement
        >(options.headingLevel, {
            class: 'abt-bibliography__heading',
        });
        heading.innerText = options.heading;
        if (options.style === 'toggle')
            heading.classList.add('abt-bibliography__heading_toggle');
        bib.appendChild(heading);
    }

    bib.appendChild(container);

    for (const meta of bibliography) {
        const item = editor.dom.create<HTMLDivElement>(
            'div',
            {
                id: meta.id,
            },
            meta.html
        );
        container.appendChild(item);
    }

    if (container.children.length > 0) {
        editor.getBody().appendChild(bib);
    }

    // Remove unnecessary &nbsp; from editor
    while (
        bib.previousElementSibling &&
        bib.previousElementSibling.childNodes.length === 1 &&
        bib.previousElementSibling.childNodes[0].nodeName === 'BR'
    ) {
        const p = bib.previousElementSibling;
        p.parentNode!.removeChild(p);
    }
    editor.setContent(editor.getBody().innerHTML);
    editor.selection.moveToBookmark(bm);
}

export function reset(doc: HTMLDocument) {
    const inlines = doc.querySelectorAll('.abt-citation, .abt_cite');
    const bib = doc.getElementById('abt-bibliography');
    for (const cite of Array.from(inlines)) {
        cite.parentNode!.removeChild(cite);
    }
    if (bib) bib.parentNode!.removeChild(bib);
}
