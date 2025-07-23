import { useState, useRef } from "react";
import styles from "./AudioRecorder.module.css";
import LongPressButton from "./LongPressButton";
import { useMicrophonePermission } from "../hooks/useMicrophonePermission";

const mimeType = "audio/webm";

const AudioRecorder = () => {
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [audio, setAudio] = useState<string | null>(null);
	const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const { permissionState, releaseMicrophonePermission, requestMicrophonePermission
		, streamRef } = useMicrophonePermission();

	const startRecording = async () => {
		if (!streamRef || permissionState !== 'granted') {
			requestMicrophonePermission();
			return;
		}
		setRecordingStatus("recording");
		navigator.mediaDevices.getUserMedia({
			audio: true,
		}).then((stream) => {
			streamRef.current = stream;
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