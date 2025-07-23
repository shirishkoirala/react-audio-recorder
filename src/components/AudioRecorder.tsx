import { useState, useRef, useEffect } from "react";
import styles from "./AudioRecorder.module.css";
import LongPressButton from "./LongPressButton";

const mimeType = "audio/webm";

const AudioRecorder = () => {
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'not-found'>('prompt');
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [audio, setAudio] = useState<string | null>(null);
	const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

	const mediaRecorder = useRef<MediaRecorder | null>(null);

	function releaseMicrophonePermission(): void {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			setStream(null);
		}
	}

	const requestMicrophonePermission = async () => {
		if ("MediaRecorder" in window) {
			navigator.mediaDevices.getUserMedia({
				audio: true,
			}).then((stream) => {
				setPermissionState('granted');
				setStream(stream);
				stream.getTracks().forEach(track => track.stop());
			}).catch((err) => {
				if (err.name === 'NotAllowedError') {
					setPermissionState('denied');
					alert("Permission denied. Please allow microphone access.");
				} else if (err.name === 'NotFoundError') {
					setPermissionState('not-found');
					alert("No microphone found. Please connect a microphone.");
				}
			});
		} else {
			setPermissionState('not-found');
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

	const startRecording = async () => {
		if (!stream || permissionState !== 'granted') {
			requestMicrophonePermission();
			return;
		}
		setRecordingStatus("recording");
		navigator.mediaDevices.getUserMedia({
			audio: true,
		}).then((stream) => {
			setPermissionState('granted');
			setStream(stream);
			const media = new MediaRecorder(stream, { mimeType: mimeType });
			mediaRecorder.current = media;
			mediaRecorder.current.start();

			let localAudioChunks: Blob[] = [];

			mediaRecorder.current.ondataavailable = (event) => {
				if (!event.data || event.data.size === 0) return;
				localAudioChunks.push(event.data);
			};

			setAudioChunks(localAudioChunks);
		});

	};

	const stopRecording = () => {
		setRecordingStatus("inactive");
		if (!mediaRecorder.current) return;
		releaseMicrophonePermission();
		mediaRecorder.current?.stop();
		mediaRecorder.current.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: mimeType });
			const audioUrl = URL.createObjectURL(audioBlob);
			setAudio(audioUrl);
			setAudioChunks([]);
		};
	};

	return (
		<main>
			<div className={styles["audio-controls"]}>
				<LongPressButton onLongPressStart={startRecording} onLongPressEnd={stopRecording} />
				{recordingStatus === "recording" ? (
					<p className={styles["status-text"]}>Recording...</p>
				) : (
					<p className={styles["status-text"]}>Press and hold to record</p>
				)}
			</div>
			{audio ? (
				<div className={styles["audio-player"]}>
					<audio src={audio} controls></audio>
					<a download href={audio}>
						Download Recording
					</a>
				</div>
			) : null}
		</main>
	);
};

export default AudioRecorder;