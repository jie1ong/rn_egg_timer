import React, { Component } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, Dimensions, Animated, PanResponder, UIManager } from 'react-native';
import { EggTimerTimeDisplay } from './src/EggTimerTimeDisplay';

const { width, height } = Dimensions.get('screen');

const SHORT_LENGTH = 4
const LONG_LENGTH = 8
const ticks = 60
const tickSection = ticks / 5


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pause: true,
            time: 0.0,
            prevTime: 0.0,
            angle: 0,
            circleOx: 0,
            circleOy: 0,
            fadeAnimation: new Animated.Value(height >= 812 ? 122 : 100),
            opacityAnimation: new Animated.Value(0)
        }

        this.timer = null;
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this.state.pause,
            onStartShouldSetPanResponderCapture: () => this.state.pause,
            onMoveShouldSetPanResponder: () => this.state.pause,
            onMoveShouldSetPanResponderCapture: () => this.state.pause,

            onPanResponderMove: (e, gestrue) => {
                const { pageX, pageY } = e.nativeEvent;
                const { circleOx, circleOy } = this.state;

                let angle = this.getAngle(pageX, pageY, circleOx, circleOy)

                this.setState({
                    angle,
                    time: angle / 360 * ticks * 60,
                    prevTime: angle / 360 * ticks * 60
                })
            },

            onPanResponderRelease: (e, gestrue) => {
                const { pageX, pageY } = e.nativeEvent;
                const { circleOx, circleOy } = this.state;

                let angle = this.getAngle(pageX, pageY, circleOx, circleOy)

                this.setState({
                    angle,
                    time: angle / 360 * ticks * 60,
                    prevTime: angle / 360 * ticks * 60
                })
                this.startFadeAnimation(0)()
                this.startClock()
            }
        })
    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer)
    }

    getAngle = (pageX, pageY, circleOx, circleOy) => {
        let tanValue = Math.abs(pageX - circleOx) / Math.abs(pageY - circleOy)
        let angle = Math.atan(tanValue) / (Math.PI / 180)

        if (pageX > circleOx) {
            if (pageY > circleOy) {
                angle = 180 - angle
            }
        } else {
            if (pageY > circleOy) {
                angle = 180 + angle
            } else {
                angle = 360 - angle
            }
        }

        return angle
    }

    startClock = () => {
        clearInterval(this.timer)
        this.setState({
            pause: false
        })
        this.timer = setInterval(() => {
            if (this.state.time < 1) {
                this.overClock()
                this.startFadeAnimation(height >= 812 ? 122 : 100)()
            } else {
                this.setState({
                    time: this.state.time - 1,
                    angle: (this.state.time - 1) / ticks / 60 * 360
                })
            }
        }, 1000)
        this.startOpacityAnimation(0)()
    }

    pauseClock = () => {
        clearInterval(this.timer)
        this.setState({
            pause: true
        })
        this.startOpacityAnimation(1)()
    }

    overClock = () => {
        clearInterval(this.timer)
        this.setState({
            pause: true,
            time: 0,
            angle: 0,
            prevTime: 0
        })
    }

    controlTimerStartOrPause = () => {
        this.state.pause ? this.startClock() : this.pauseClock()
    }

    controlTimerRestart = () => {
        this.setState({
            time: this.state.prevTime,
            angle: this.state.prevTime / ticks / 60 * 360
        })
    }

    controlTimerReset = () => {
        this.setState({
            time: 0,
            angle: 0,
            prevTime: 0
        })
        this.startOpacityAnimation(0)()
        this.startFadeAnimation(height >= 812 ? 122 : 100)()
    }

    startFadeAnimation = (value) => {
        return () => {
            Animated.spring(this.state.fadeAnimation, {
                toValue: value
            }).start()
        }
    }

    startOpacityAnimation = (num) => {
        return () => {
            Animated.spring(this.state.opacityAnimation, {
                toValue: num
            }).start()
        }
    }

    renderTick = () => {
        return new Array(ticks).fill(null).map((_, index) => (
            <View
                key={index}
                style={[styles.tickRadius, { transform: [{ rotateZ: `${360 / ticks * index}deg` }] }]}>
                <View style={[
                    styles.shortDot,
                    { height: index % 5 === 0 ? LONG_LENGTH : SHORT_LENGTH },
                    { top: index % 5 === 0 ? -5 : 0 }
                ]} />
            </View>
        ))
    }

    renderTickText = () => {
        return new Array(tickSection).fill(null).map((_, index) => (
            <View key={index} style={[styles.tickTextRadius, { transform: [{ rotateZ: `${360 / tickSection * index}deg` }] }]}>
                <Text style={styles.tickText}>{index * 5 < 10 ? '0' + index * 5 : index * 5}</Text>
            </View>
        ))
    }

    handleLayout = (e) => {
        UIManager.measure(e.target, (x, y, width, height, left, top) => {
            this.setState({
                circleOx: left + width / 2,
                circleOy: top + height / 2
            })
        })
    }

    render() {
        const { pause, time, angle } = this.state;

        let min = Math.floor(time / 60)
        let sec = Math.round(time) % 60

        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <EggTimerTimeDisplay time={`${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`} />
                    <View style={styles.clockContainer}>
                        <View style={[styles.bigCircle, styles.shadow]}>
                            <View style={styles.tickCircle}>
                                <View style={[styles.midCircle, styles.shadow]}>
                                    <Animated.View
                                        {...this._panResponder.panHandlers}
                                        ref={ref => this.clockRef = ref}
                                        onLayout={this.handleLayout}
                                        style={[styles.midCircle, { transform: [{ rotateZ: `${pause ? angle : 360 / ticks / 60 * time}deg` }] }]}>
                                        <View style={styles.smallCircle}></View>
                                        <View
                                            style={[styles.triangle, styles.shadow, { shadowOffset: { width: 1, height: -1 } }]} />
                                    </Animated.View>
                                </View>
                                {this.renderTick()}
                            </View>
                            {this.renderTickText()}
                        </View>
                    </View>
                    <Animated.View
                        style={[styles.controlContainer, { transform: [{ translateY: this.state.fadeAnimation }] }]}>
                        <Animated.View style={[styles.row, { opacity: this.state.opacityAnimation }]}>
                            <TouchableOpacity style={styles.button} onPress={this.controlTimerRestart} disabled={!pause}>
                                <Text style={styles.text}>RESTART</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={this.controlTimerReset} disabled={!pause}>
                                <Text style={styles.text}>RESET</Text>
                            </TouchableOpacity>
                        </Animated.View>
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.bigButton} onPress={this.controlTimerStartOrPause}>
                                <Text style={styles.text}>{pause ? 'RESUME' : 'PAUSE'}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    safeArea: {
        backgroundColor: '#efefef',
        flex: 1
    },
    clockContainer: {
        height: width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bigCircle: {
        position: 'relative',
        width: width - 30,
        height: width - 30,
        borderRadius: width - 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    midCircle: {
        position: 'relative',
        width: width - 145,
        height: width - 145,
        borderRadius: width - 145,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    smallCircle: {
        width: width - 180,
        height: width - 180,
        borderRadius: width - 180,
        backgroundColor: '#fff',
        borderColor: '#efefef',
        borderWidth: 1
    },
    tickCircle: {
        width: width - 115,
        height: width - 115,
        justifyContent: 'center',
        alignItems: 'center'
    },
    shadow: {
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowOffset: {
            width: 1,
            height: 1
        }
    },
    shortDot: {
        width: 1,
        backgroundColor: '#000',
        position: 'absolute',
        left: 0
    },
    tickRadius: {
        position: 'absolute',
        top: 0,
        width: 1,
        height: width - 115,
        backgroundColor: 'transparent'
    },
    tickTextRadius: {
        position: 'absolute',
        top: 15,
        width: 20,
        height: width - 60,
        backgroundColor: 'transparent'
    },
    tickText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Helvetica Neue'
    },
    triangle: {
        position: 'absolute',
        top: -20,
        width: 0,
        height: 0,
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderColor: 'transparent',
        borderBottomColor: '#000'
    },
    controlContainer: {
        position: 'absolute',
        bottom: 0
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        paddingHorizontal: 30,
        height: 50,
        justifyContent: 'center'
    },
    bigButton: {
        width,
        height: height >= 812 ? 72 : 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 20,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Helvetica Neue'
    }
});
