import { Map as ImmutableMap, fromJS } from 'immutable';
import {
  STICKER_FETCH_SUCCESS,
  STICKER_APPEND_EMOJI,
} from '../actions/stickers';
import {
  STPACK_FETCH_SUCCESS,
  STPACK_UPDATE,
} from '../actions/stpacks';
import {
  RECENT_STPACKS_REFRESH_SUCCESS,
  RECENT_STPACKS_EXPAND_SUCCESS,
} from '../actions/recent_stpacks';
import {
  SEARCH_STPACKS_REFRESH_SUCCESS,
  SEARCH_STPACKS_EXPAND_SUCCESS,
} from '../actions/search_stpacks';

const normalizeSticker = (state, sticker) => {
  sticker = { ...sticker };

  return state.set(sticker.id_str, fromJS(sticker));
};

const normalizeStickers = (state, stickers) => {
  stickers.forEach(sticker => {
    state = normalizeSticker(state, sticker);
  });

  return state;
};

const normalizeStickerFromStpack = (state, stpack) => {
  state = normalizeStickers(state, stpack.stickers);

  return state;
};

const normalizeStickerFromStpackList = (state, stpackList) => {
  stpackList.results.forEach(stpack => {
    state = normalizeStickerFromStpack(state, stpack);
  });

  return state;
};

const initialState = ImmutableMap();

export default function sitckers(state = initialState, action) {
  switch(action.type) {
  case STICKER_APPEND_EMOJI:
    return state.updateIn([action.id, 'emojis'], emojis => emojis.concat(action.emoji));
  case STICKER_FETCH_SUCCESS:
    return normalizeSticker(state, action.sticker);
  case STPACK_FETCH_SUCCESS:
  case STPACK_UPDATE:
    return normalizeStickerFromStpack(state, action.stpack);
  case RECENT_STPACKS_REFRESH_SUCCESS:
  case RECENT_STPACKS_EXPAND_SUCCESS:
  case SEARCH_STPACKS_REFRESH_SUCCESS:
  case SEARCH_STPACKS_EXPAND_SUCCESS:
    return normalizeStickerFromStpackList(state, action.stpackList);
  default:
    return state;
  }
}
