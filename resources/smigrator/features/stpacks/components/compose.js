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
    if ( this.node && !this.node.contains(e.target) ) {
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
      this.props.onClose();
    }
  }

  setRef = c => {
    this.node = c;
  }

  render () {
    const PICKER_WIDTH = 338;
    const PICKER_HEIGHT = 354;

    const style = {
      position: 'absolute',
      margin: 'auto',
      width: `${PICKER_WIDTH}px`,
      height: `${PICKER_HEIGHT}px`,
      ...this.props.style,
    };

    return (
      <div style={style} ref={this.setRef} onKeyDown={this.handleKeyDown}>
        <Picker
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

export class PublishButton extends React.PureComponent {

  static propTypes = {
    submittable: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  render () {
    const { submittable, submitting } = this.props;
    let icon, message;

    if (submittable && !submitting) {
      icon    = <i className='fa fa-paint-brush' aria-hidden />;
      message = <FormattedMessage id='compose.publish' defaultMessage='Publish' />;
    } else if (submitting) {
      icon    = <i className='fa fa-spin fa-spinner' aria-hidden='true' />;
      message = <FormattedMessage id='compose.requesting' defaultMessage='Requesting...' />;
    } else {
      icon    = null;
      message = <FormattedMessage id='compose.specify_emojis' defaultMessage='Specify emoijs' />;
    }

    return (
      <div className='stpack__compose-button'>
        <button className='rich-button button' disabled={!submittable || submitting} title={message} aria-label={message} onClick={this.props.onClick}>
          { icon }
          { message }
        </button>
      </div>
    );
  }

}

export default class Compose extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    stickerId: PropTypes.string,
    stpack: ImmtuablePropTypes.map,
    includedStickers: ImmtuablePropTypes.list,
    submitting: PropTypes.bool.isRequired,
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
    if ( !this.props.submitting && this.props.stpack.get('stickers').size === nextProps.includedStickers.filter(sticker => sticker.get('emojis').size > 0 ).size ) {
      this.setState({ submittable: true });
    } else if ( this.props.submitting || this.state.submittable) {
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
    const { stpack, stickerId, submitting } = this.props;

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

        <PublishButton
          submitting={submitting}
          submittable={submittable}
          onClick={this.handlePatch}
        />
      </div>
    );
  }

}