import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import AdminNotice from 'components/admin-notice';
import { deprecatedGetFromISBN } from 'utils/resolvers/isbn';
import { deprecatedGetFromURL } from 'utils/resolvers/url';

import AutoCite from '_legacy/dialogs/add/autocite';
import ContributorList from '_legacy/dialogs/components/contributor-list';
import MetaFields from '_legacy/dialogs/components/meta-fields';
import Store from '_legacy/stores/ui/add-dialog';

import styles from './manual-input.scss';

interface Props {
    store: Store;
}

@observer
export default class ManualInput extends React.Component<Props> {
    static readonly citationTypes: Array<{ value: string; label: string }> =
        top.ABT.i18n.citation_types;
    static readonly labels = top.ABT.i18n.dialogs.add.manual_input;

    focusTypeSelect = (e: HTMLSelectElement | null): void =>
        e ? e.focus() : void 0;

    @action
    setErrorMessage = (message: string = ''): void => {
        this.props.store.errorMessage = message;
    };

    @action
    handleTypeChange = (e: React.FormEvent<HTMLSelectElement>): void => {
        this.props.store.data.init(e.currentTarget.value as CSL.ItemType);
    };

    @action
    toggleLoadingState = (): void => {
        this.props.store.isLoading = !this.props.store.isLoading;
    };

    handleAutocite = async (query: string): Promise<void> => {
        const { citationType } = this.props.store.data;
        this.toggleLoadingState();
        try {
            const data =
                citationType === 'webpage'
                    ? await deprecatedGetFromURL(query)
                    : await deprecatedGetFromISBN(query, citationType as
                          | 'book'
                          | 'chapter');
            runInAction(() => this.props.store.data.merge(data));
        } catch (e) {
            this.setErrorMessage(e.message);
        }
        this.toggleLoadingState();
    };

    handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = !isScrollingDown;
        const isScrollable =
            e.currentTarget.scrollHeight > e.currentTarget.clientHeight;
        const atBottom =
            e.currentTarget.scrollHeight <=
            e.currentTarget.clientHeight + Math.ceil(e.currentTarget.scrollTop);
        const atTop = e.currentTarget.scrollTop === 0;

        if (isScrollable && !atBottom && isScrollingDown) {
            e.cancelable = false;
        }

        if (isScrollable && !atTop && isScrollingUp) {
            e.cancelable = false;
        }
    };

    render(): JSX.Element {
        const { store } = this.props;
        const itemType = store.data.citationType;
        const renderAutocite: boolean = ['webpage', 'book', 'chapter'].includes(
            itemType,
        );
        return (
            <>
                <div className={styles.typeSelect}>
                    <label
                        className={styles.label}
                        htmlFor="type-select"
                        children={ManualInput.labels.citation_type}
                    />
                    <select
                        id="type-select"
                        className={styles.select}
                        ref={this.focusTypeSelect}
                        onChange={this.handleTypeChange}
                        value={itemType}
                    >
                        {ManualInput.citationTypes.map((item, i) => (
                            <option
                                key={i}
                                value={item.value}
                                aria-selected={itemType === item.value}
                                children={item.label}
                            />
                        ))}
                    </select>
                </div>
                {renderAutocite && itemType === 'webpage' && (
                    <AutoCite
                        getter={this.handleAutocite}
                        kind={itemType as 'webpage'}
                        placeholder={ManualInput.labels.URL}
                    />
                )}
                {renderAutocite && ['book', 'chapter'].includes(itemType) && (
                    <AutoCite
                        getter={this.handleAutocite}
                        kind={itemType as 'book' | 'chapter'}
                        placeholder={ManualInput.labels.ISBN}
                        pattern="(?:[\dxX]-?){10}|(?:[\dxX]-?){13}"
                    />
                )}
                <div
                    onWheel={this.handleWheel}
                    className={
                        renderAutocite
                            ? styles.scrollBoundaryAutocite
                            : styles.scrollBoundary
                    }
                >
                    {store.errorMessage && (
                        <AdminNotice
                            kind="error"
                            isDismissible
                            onDismiss={() => this.setErrorMessage()}
                        >
                            {store.errorMessage}
                        </AdminNotice>
                    )}
                    {itemType !== 'article' && (
                        <ContributorList
                            people={store.data.people}
                            citationType={itemType}
                        />
                    )}
                    <MetaFields meta={this.props.store.data} />
                </div>
            </>
        );
    }
}
