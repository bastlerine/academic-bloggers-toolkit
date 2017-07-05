interface HasElement {
    element: HTMLElement;
}

/**
 * Prevents the wheel event from bubbling through to parent elements.
 *
 * In order for this function to work, the component of interest's "this" must
 *   be bound and there must be an "element" property in the component.
 * @param {WheelEvent} e React Wheel Event
 * @return {void}
 */
export function preventScrollPropagation(this: HasElement, e): void {
    e.stopPropagation();
    const atTopAndScrollingUp: boolean =
        this.element.scrollTop === 0 && e.deltaY < 0; // tslint:disable-line
    const atBottomAndScollingDown: boolean =
        Math.floor(this.element.scrollTop + this.element.offsetHeight) ===
            this.element.scrollHeight && e.deltaY > 0; // tslint:disable-line
    if (atTopAndScrollingUp || atBottomAndScollingDown) {
        e.preventDefault();
    }
}
