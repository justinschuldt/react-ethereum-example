import React, { Component } from "react";
import { Button, Form, Field, Input, Textarea } from 'rimble-ui';
import styles from './BallotAdmin.module.scss';

export default class BallotAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.ballotName,
      validatedName: false,
      proposal: this.props.proposal,
      validatedProposal: false
    };
    this.onNameChange = this.onNameChange.bind(this)
    this.onProposalChange = this.onProposalChange.bind(this)
  }
  onNameChange(evt) {
    this.setState({
      name: evt.target.value
    });
    evt.target.parentNode.classList.add('was-validated');
  }
  onProposalChange(evt) {
    this.setState({
      proposal: evt.target.value
    });
    evt.target.parentNode.classList.add('was-validated');
  }

  handleSubmitName = e => {
    e.preventDefault();
    this.props.updateName(this.state.name)
  };
  handleSubmitProposal = e => {
    e.preventDefault();
    this.props.updateProposal(this.state.proposal)
  };

  render()  {
    const {
      startVotingPeriod,
      endVotingPeriod,
      voteState
    } = this.props;
    return (
      <div className={styles.ballotAdmin}>
        <h3> Ballot Admin </h3>
        <div className={styles.label}>
          Update contract state
        </div>
        <div className={styles.updates}>
      
          <Form onSubmit={this.handleSubmitName}>
            <Field width={1}>
              <Input
                defaultValue={this.state.name}
                onChange={this.onNameChange}
                required
                width={1}
              />
            </Field>
            <Button
              disabled={voteState !== 'Created'}
              type="submit"
              width={1}
             >
              Update Name
            </Button>
          </Form>
          <Form onSubmit={this.handleSubmitProposal}>
            <Field width={1}>
              <Textarea
                defaultValue={this.state.proposal}
                onChange={this.onProposalChange}
                required
                width={1}
              />
            </Field>
            <Button
              disabled={voteState !== 'Created'}
              type="submit"
              width={1}
            >
              Update Proposal
            </Button>
          </Form>
        </div>

        <div className={styles.buttons}>
          <Button
            onClick={startVotingPeriod}
            disabled={voteState !== 'Created'}
            >
            Start Voting Period
          </Button>
          <Button
            onClick={endVotingPeriod}
            disabled={voteState !== 'Voting'}
            >
            End Voting Period
          </Button>
        </div>
      </div>
    );
  }
}
