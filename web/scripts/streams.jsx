import React from 'react';

const metrics = {
    width: 930,
    height: 567
};

export class TwitchIframe extends React.Component {
    render() {
        return (
            <iframe
                src={`https://player.twitch.tv/?channel=${this.props.username}`}
                frameBorder="0"
                scrolling="no"
                height={metrics.height}
                width={metrics.width}>
            </iframe>
        );
    }
}

export class TwitchChatRoom extends React.Component {
    render() {
        return (
            <iframe
                src={`https://www.twitch.tv/${this.props.username}/chat?popout=`}
                frameBorder="0"
                scrolling="no"
                height={metrics.height}
                width="350">
            </iframe>
        );
    }
}

export class TwitchStream extends React.Component {
    render() {
        return (
            <div>
                <TwitchIframe username={this.props.stream} />
                <TwitchChatRoom username={this.props.stream} />
            </div>
        );
    }
}

class Streams extends React.Component {
    render() {
        const twitchStreams = this.props.streams.map((stream) => {
            return (
                <TwitchStream className="stream" key={`stream-${stream}`} username={stream}/>
            );
        });

        return (
            <div className="streams container-fluid">
                {twitchStreams}
                {this.props.children}
            </div>
        );
    }
}

export default Streams;
