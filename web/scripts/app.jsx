import React from 'react';
import { Streams, TwitchChatRoom, TwitchStream } from './streams.jsx';
import Select from 'react-select-plus';

class TwitchStreamPicker extends React.Component {
    constructor() {
        super();

        this.state = {stream: null}
    }

    setStream(value) {
        this.setState({stream: value.value});
        this.props.setStream(value.value);
    }

    render() {
        const options = getOptions(this.props.teams);
        const stream = this.state.stream || this.props.stream;
        console.log('stream', stream);

        return (
                <Select
                    onChange={this.setStream.bind(this)}
                    options={options}
                    placeholder={this.props.placeholder}
                    value={stream} />
        );
    }
}

class App extends React.Component {
    render() {
        const stream1 = this.props.streams.length ? <TwitchStream stream={this.props.streams[0]} /> : '';
        const stream2 = this.props.streams.length > 1 ? <TwitchStream stream={this.props.streams[1]} /> : '';

        return (
            <div>
                <div className="well top">
                    <div className="row">
                        <div className="col-sm-6">
                            <TwitchStreamPicker
                                teams={this.props.teams}
                                stream={this.props.streams[0]}
                                setStream={this.props.setStream1}
                                placeholder="Velg stream for lag #1"/>
                        </div>

                        <div className="col-sm-6">
                            <TwitchStreamPicker
                                teams={this.props.teams}
                                stream={this.props.streams[1]}
                                setStream={this.props.setStream2}
                                placeholder="Velg stream for lag #2"/>
                        </div>
                    </div>
                </div>
                <div className="stream-1">{stream1}</div>
                <div className="stream-2">{stream2}</div>
                {this.props.children}
            </div>
        );
    }
}

function getOptions(teams) {
    return teams.map((team) => {
        return {
            label: team.name,
            options: team.twitch.map((twitch) => {
                return {
                    label: twitch,
                    value: twitch
                };
            })
        };
    });
}

export default App;
