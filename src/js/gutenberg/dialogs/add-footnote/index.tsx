import { Button } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import {
    Component,
    ComponentType,
    createRef,
    FormEvent,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import asDialog from 'components/as-dialog';
import DialogToolbar from 'components/dialog-toolbar';
import TextareaAutosize from 'components/textarea-autosize';

import styles from './style.scss';

namespace Dialog {
    export interface State {
        value: string;
    }
    export interface OwnProps extends asDialog.Props {
        onSubmit(value: string): void;
    }
    export type Props = OwnProps;
}
class Dialog extends Component<Dialog.Props, Dialog.State> {
    state = {
        value: '',
    };

    private inputRef = createRef<HTMLTextAreaElement>();

    componentDidMount() {
        setTimeout(() => {
            if (this.inputRef.current) {
                this.inputRef.current.focus();
            }
        }, 100);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <TextareaAutosize
                    inputRef={this.inputRef}
                    value={this.state.value}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            this.props.onSubmit(this.state.value);
                        }
                    }}
                    onChange={e =>
                        this.setState({ value: e.currentTarget.value })
                    }
                />
                <DialogToolbar>
                    <div className={styles.toolbar}>
                        <Button isPrimary isLarge type="submit">
                            {__('Add footnote', 'academic-bloggers-toolkit')}
                        </Button>
                    </div>
                </DialogToolbar>
            </form>
        );
    }

    private handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.props.onSubmit(this.state.value);
    };
}

export default compose([asDialog])(Dialog) as ComponentType<Dialog.OwnProps>;
