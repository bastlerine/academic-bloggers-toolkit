// Type definitions for @wordpress/editor
// Definitions by: Derek P Sifford <dereksifford@gmail.com>

declare module '@wordpress/editor' {
    import { Component, ComponentType, CSSProperties, HTMLProps } from 'react';

    interface NavigatableToolbarProps {
        /**
         * Make the toolbar will get focus as soon as it mounted.
         */
        focusOnMount?: boolean;
    }

    interface RichTextProps {
        value: string;
        tagName?: string;
        placeholder?: string;
        multiline?: boolean | string;
        formattingControls?: string[];
        isSelected?: boolean;
        keepPlaceholderOnFocus?: boolean;
        // TODO:
        autocompleters?: any[];
        // TODO:
        style?: CSSProperties;
        wrapperClassName?: string;
        className?: string;
        inlineToolbar?: boolean;
        onChange(value: string): void;
        onTagNameChange?(tagName: string): void;
        onReplace?(blocks: any[]): void;
        onMerge?(forward: boolean): void;
        onRemove?(forward: boolean): void;
    }

    export class RichText extends Component<RichTextProps> {
        static Content(): string;
        static isEmpty(value: string): boolean;
    }

    export const InspectorControls: ComponentType;
    export const NavigableToolbar: ComponentType<HTMLProps<HTMLElement>>;

    export namespace AlignmentToolbar {
        interface Props {
            isCollapsed?: boolean;
            value: 'left' | 'right' | 'center';
            onChange(nextAlign: 'left' | 'right' | 'center'): void;
        }
    }
    export const AlignmentToolbar: ComponentType<AlignmentToolbar.Props>;
}
