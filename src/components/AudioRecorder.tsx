import styles from "./AudioRecorder.module.css";
import LongPressButton from "./LongPressButton";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

const mimeType = "audio/webm";

const AudioRecorder = () => {
	const { startRecording, stopRecording, recordingStatus, audioUrl } = useAudioRecorder(mimeType);

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
			{audioUrl ? (
				<div className={styles["audio-player"]}>
					<audio src={audioUrl} controls></audio>
					<a download href={audioUrl}>
						Download Recording
					</a>
				</div>
			) : null}
		</main>
	);
};

export default AudioRecorder;