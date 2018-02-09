import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import {
  fetchStpack,
  connectStpack,
  disconnectStpack,
} from '@/actions/stpacks';

import Page from '@/features/app/components/page';
import Content from '@/features/app/components/content';
import GeneralHeader from '@/features/general_header';
import LoadingIndicator from '@/components/loading_indicator';
import StpackContainer from '@/features/stpacks/containers/stpack_container';
import StpackComposeContainer from '@/features/stpacks/containers/stpack_compose_container';

import { DOWNLOADED, COMPILING, UPLOADING, UPLOADED, FAILED } from '@/features/stpacks/util/constants';

const mapStateToProps = (state, { match }) => ({
  stpack: state.getIn(['stpacks', match.params.id]),
});

@connect(mapStateToProps)
export default class Stpacks extends ImmutablePureComponent {

  static propTypes = {
    stpack: ImmutablePropTypes.map,
    match: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
  }

  componentWillMount () {
    this.props.dispatch(connectStpack(this.props.match.params.id));

    if ( !this.props.stpack ) {
      this.props.dispatch(fetchStpack(this.props.match.params.id));
    }
  }

  componentWillUnmount () {
    this.props.dispatch(disconnectStpack(this.props.match.params.id));
  }

  renderContent (id, status) {
    switch(status) {
    case DOWNLOADED:
      return <StpackComposeContainer id={id} />;
    case COMPILING:
    case UPLOADING:
    case UPLOADED:
      return <StpackContainer id={id} />;
    case FAILED:
    default:
      return (
        <div>Unexpected error occured</div>
      );
    }
  }

  render () {
    const { id } = this.props.match.params;
    const { stpack } = this.props;

    if ( !stpack ) {
      return <LoadingIndicator />;
    }

    return (
      <Page>
        <GeneralHeader />

        <Content>
          { this.renderContent(id, stpack.get('status')) }
        </Content>
      </Page>
    );
  }

}
