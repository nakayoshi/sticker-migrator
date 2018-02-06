import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { patchStpack } from '../actions/stpacks';
import {
  appendStickerEmoji,
  expandStickerEmojiPicker,
} from '../actions/stickers';
import StpackCompose from '../components/stpack_compose';

const mapStateToProps = (state, { id }) => ({
  stpack: state.getIn(['stpacks', id], null),
  targetNode: state.getIn(['stpack_compose', 'targetNode']),
});

const mapDispatchToProps = (dispatch, { id }) => ({

  onPatch() {
    dispatch(patchStpack(id));
  },

  onExpandStickerEmojiPicker(node) {
    dispatch(expandStickerEmojiPicker(node));
  },

  onappendStickerEmoji(stickerId, emoji) {
    dispatch(appendStickerEmoji(stickerId, emoji));
  },

});

export default injectIntl(connect(
  mapStateToProps,
  mapDispatchToProps,
)(StpackCompose));
