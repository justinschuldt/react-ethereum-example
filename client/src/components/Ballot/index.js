import React, { Component } from "react";
import { PublicAddress, Button, Form, Field, Input } from 'rimble-ui';
import styles from './Ballot.module.scss';

export default class Ballot extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: ''
    }
    this.onNameChange = this.onNameChange.bind(this)

  }

  onNameChange(evt) {
    this.setState({
      name: evt.target.value
    });
    evt.target.parentNode.classList.add('was-validated');
  }

  handleSubmitRegistration = e => {
    e.preventDefault();
    this.props.registerVoter(this.state.name)
  };
  render()  {
    const {
      contract,
      ballotName,
      proposal,
      voteState,
      voteCount,
      voterCount,
      finalCount,
      isAddressRegistered,
      hasAddressVoted,
      castVote
    } = this.props;
    return (
      <div className={styles.ballot}>
        <h3> A Ballot Contract Instance </h3>

        <div className={styles.dataPoint}>
          <div className={styles.value}>
            <PublicAddress address={contract._address} />
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Ballot Name:
          </div>
          <div className={styles.value}>
            {ballotName}
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Description:
          </div>
          <div className={styles.value}>
            {proposal}
          </div>
        </div>

        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Ballot Status:
          </div>
          <div className={styles.value}>
            {voteState}
          </div>
        </div>

        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Voters Registered:
          </div>
          <div className={styles.value}>
            {voterCount}
          </div>
        </div>

        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Votes Cast:
          </div>
          <div className={styles.value}>
            {voteCount}
          </div>
        </div>


        {voteState !== 'Ended' ? <>
          <div className={styles.buttons}>
            <div>
            <Form onSubmit={this.handleSubmitRegistration}>
                <Field width={1}>
                  <Input
                    placeholder="Voter Name"
                    onChange={this.onNameChange}
                    required
                    width={1}
                  />
                </Field>
                <Button
                  type="submit"
                  width={1}
                  disabled={voteState !== 'Ended' && isAddressRegistered}
                >
                  Register to Vote
                </Button>
              </Form>
            </div>
          
            <Button
              onClick={() => castVote(true)}
              disabled={hasAddressVoted}
            >
              Vote Yes
            </Button>
            <Button
              onClick={() => castVote(false)}
              disabled={hasAddressVoted}
            >
              Vote No
            </Button>

            {hasAddressVoted ? <>
              <div className={styles.dataPoint}>
              <div className={styles.label}>
                Your vote has been received.
              </div>
              <div className={styles.value}>
                
              </div>
            </div>

            </> : null}

          </div>
        
        </> : <>
              
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Voting Complete. Total "Yes" responses:
          </div>
          <div className={styles.value}>
            {finalCount}
          </div>
        </div>

        </>}

      </div>
    );
  }
}
