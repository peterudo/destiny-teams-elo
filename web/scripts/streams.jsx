import React from 'react';

const metrics = {
    width: 930,
    height: 567
};

export class TwitchIframe extends React.Component {
    componentDidMount() {
        const iframe = this.refs.iframe;
        const wrapper = this.refs.wrapper;

        const metrics = getMetrics();

        iframe.width = metrics.width;
        iframe.height = metrics.height;
        wrapper.style.width = metrics.width + 'px';
        wrapper.style.height = metrics.height + 'px';
    }

    render() {
        return (
            <div className="twitch-iframe" ref="wrapper">
                <iframe
                    ref="iframe"
                    src={`https://player.twitch.tv/?channel=${this.props.username}`}
                    frameBorder="0"
                    scrolling="no"
                    height={metrics.height}
                    width={metrics.width}>
                </iframe>
            </div>
        );
    }
}

export class TwitchChatRoom extends React.Component {
    componentDidMount() {
        const iframe = this.refs.iframe;
        const wrapper = this.refs.wrapper;

        const metrics = getMetrics();
        const width = Math.min(window.innerWidth - metrics.width, 310);

        iframe.width = width;
        iframe.height = metrics.height;
        wrapper.style.width = width + 'px';
        wrapper.style.height = metrics.height + 'px';
    }

    render() {
        return (
            <div className="twitch-chat" ref="wrapper">
                <iframe
                    ref="iframe"
                    src={`https://www.twitch.tv/${this.props.username}/chat?popout=`}
                    frameBorder="0"
                    scrolling="no"
                    height={metrics.height}
                    width="310">
                </iframe>
            </div>
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

function getMetrics() {
    const height = (window.innerHeight - 58) / 2;
    const width = height * 1.64021164021164;

    return {width, height};
}

export default Streams;
