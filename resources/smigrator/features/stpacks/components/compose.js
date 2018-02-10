import React from 'react';
import PropTypes from 'prop-types';
import ImmtuablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { Picker } from 'emoji-mart';
import Overlay from 'react-overlays/lib/Overlay';
import detectPassiveEvents from 'detect-passive-events';
import LetterHead from '@/features/stpacks/components/letter_head';
import StickerEmojiSelector from '@/containers/sticker_emoji_selector_container';
import { FormattedMessage } from 'react-intl';

const listenerOptions = detectPassiveEvents.hasSupport ? { passive: true } : false;

export class EmojiPicker extends React.PureComponent {

  static propTypes = {
    style: PropTypes.object,
    stickerId: PropTypes.string,
    onAppend: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  handleDocumentClick = e => {
    if ( !e.target.classList.contains('sticker_add-emojis') ) {
      this.props.onClose();
    }
  }

  handleKeyDown = e => {
    switch(e.key) {
    case 'Escape':
      this.props.onClose();
      break;
    }
  }

  handleAppend= emoji => {
    const { native } = emoji;

    if ( this.props.stickerId && native ) {
      this.props.onAppend(this.props.stickerId, native);
    }
  }

  render () {
    const { style } = this.props;
    const PICKER_WIDTH = 338;
    const PICKER_HEIGHT = 354;

    return (
      <div style={{ position: 'absolute', margin: 'auto', width: `${PICKER_WIDTH}px`, height: `${PICKER_HEIGHT}px`, ...style }} onKeyDown={this.handleKeyDown}>
        <Picker
          ref={this.setEmojiPickerRef}
          set='apple'
          color={false}
          showPreview={false}
          onClick={this.handleAppend}
          emojiTooltip
        />
      </div>
    );
  }

}

export default class Compose extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    stpack: ImmtuablePropTypes.map,
    stickerId: PropTypes.string,
    includedStickers: ImmtuablePropTypes.list,
    onAppend: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  state = {
    submittable: false,
  }

  shouldComponentUpdate (nextProps) {
    if ( this.props.includedStickers.map(sticker => sticker.get('emojis').size) !== nextProps.includedStickers.map(sticker => sticker.get('emojis').size) ) {
      return true;
    }

    return false;
  }

  componentWillReceiveProps (nextProps) {
    if ( this.props.stpack.get('stickers').size === nextProps.includedStickers.filter(sticker => sticker.get('emojis').size > 0 ).size ) {
      this.setState({ submittable: true });
    } else if (this.state.submittable) {
      this.setState({ submittable: false });
    }
  }

  handlePatch = e => {
    e.preventDefault();

    if (this.state.submittable) {
      this.props.onPatch();
    }
  }

  setEmojiPickerRef = c => {
    this.emojiPicker = c;
  }

  renderItem (stickerId, i) {
    const { stpack } = this.props;

    return (
      <li className='stpack__sticker' key={stickerId} aria-posinset={i+1} aria-setsize={stpack.get('stickers').size}>
        <StickerEmojiSelector stickerId={stickerId} />
      </li>
    );
  }

  render () {
    const { submittable } = this.state;
    const { stpack, stickerId } = this.props;

    const targetNode = stickerId && document.querySelector(`.sticker[data-sticker-id="${stickerId}"]`);
    const placement  = targetNode && document.body.clientHeight - targetNode.offsetTop - targetNode.offsetHeight < 400 ? 'top' : 'bottom';

    if (!stpack) {
      return null;
    }

    return (
      <div className='stpack'>
        <LetterHead stpack={stpack} />

        <Overlay show={!!stickerId} placement={placement} target={targetNode}>
          <EmojiPicker
            stickerId={stickerId}
            onAppend={this.props.onAppend}
            onClose={this.props.onClose}
          />
        </Overlay>

        <div className='stpack__compose-description'>
          <FormattedMessage id='compose.description' defaultMessage='This sticker set has not migrated to Telegram. Click following stickers to specify emoij and then publish to Telegram!' />
        </div>

        <ul className='stpack__stickers'>
          { stpack.get('stickers').map((stickerId, i) => this.renderItem(stickerId, i)) }
        </ul>

        <div className='stpack__compose-button'>
          <button className='rich-button button' disabled={!submittable} onClick={this.handlePatch}>
            { submittable && <i className='fa fa-paint-brush' aria-hidden /> }
            { submittable ? <FormattedMessage id='compose.publish' defaultMessage='Publish' /> : <FormattedMessage id='compose.specify_emojis' defaultMessage='Specify emoijs' /> }
          </button>
        </div>
      </div>
    );
  }

}
