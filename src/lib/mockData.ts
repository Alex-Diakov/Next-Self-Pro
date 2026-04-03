import { AnalysisMarker, TranscriptLine } from '../types';

export const mockMarkers: AnalysisMarker[] = [
  { id: 'm1', timestamp: 12, duration: 5, type: 'emotion', label: 'Anxiety', intensity: 0.8, description: 'Patient shows signs of high anxiety when discussing work.' },
  { id: 'm2', timestamp: 25, duration: 3, type: 'speech', label: 'Stuttering', intensity: 0.6, description: 'Noticeable stuttering during the explanation.' },
  { id: 'm3', timestamp: 45, duration: 10, type: 'insight', label: 'Realization', intensity: 0.9, description: 'Patient realizes the connection between past trauma and current behavior.' },
  { id: 'm4', timestamp: 65, duration: 4, type: 'emotion', label: 'Sadness', intensity: 0.7, description: 'Voice breaks, eyes tear up.' },
  { id: 'm5', timestamp: 80, duration: 6, type: 'speech', label: 'Rapid Speech', intensity: 0.8, description: 'Speaking very quickly, possibly indicating nervousness.' },
  { id: 'm6', timestamp: 105, duration: 8, type: 'emotion', label: 'Anger', intensity: 0.7, description: 'Frustration evident in tone.' },
  { id: 'm7', timestamp: 120, duration: 5, type: 'insight', label: 'Breakthrough', intensity: 1.0, description: 'A major breakthrough in understanding their coping mechanism.' },
  { id: 'm8', timestamp: 140, duration: 4, type: 'emotion', label: 'Relief', intensity: 0.6, description: 'Deep sigh, posture relaxes.' },
  { id: 'm9', timestamp: 165, duration: 7, type: 'speech', label: 'Long Pause', intensity: 0.5, description: 'Taking a long time to answer the question.' },
  { id: 'm10', timestamp: 185, duration: 5, type: 'emotion', label: 'Fear', intensity: 0.8, description: 'Expressing fear about the future.' },
  { id: 'm11', timestamp: 210, duration: 6, type: 'insight', label: 'Self-Reflection', intensity: 0.7, description: 'Reflecting on their own actions.' },
  { id: 'm12', timestamp: 230, duration: 4, type: 'emotion', label: 'Joy', intensity: 0.6, description: 'Smiling when talking about a positive memory.' },
  { id: 'm13', timestamp: 255, duration: 5, type: 'speech', label: 'Whispering', intensity: 0.4, description: 'Voice drops to a whisper.' },
  { id: 'm14', timestamp: 280, duration: 8, type: 'emotion', label: 'Confusion', intensity: 0.5, description: 'Seems confused by the therapist\'s question.' },
  { id: 'm15', timestamp: 300, duration: 5, type: 'insight', label: 'Acceptance', intensity: 0.8, description: 'Accepting the situation as it is.' },
];

export const mockTranscript: TranscriptLine[] = [
  { id: 't1', timestamp: '0:01', speaker: 'Психолог', text: 'Здравствуйте. Как прошла ваша неделя? Было ли что-то особенное, о чем вы хотели бы сегодня поговорить?' },
  { id: 't2', timestamp: '0:08', speaker: 'Пациент', text: 'Честно говоря, неделя была довольно напряженной. На работе опять возникли те же проблемы с руководством.' },
  { id: 't3', timestamp: '0:15', speaker: 'Психолог', text: 'Понимаю. Расскажите подробнее, что именно произошло в этот раз? Какие чувства это у вас вызвало?' },
  { id: 't4', timestamp: '0:22', speaker: 'Пациент', text: 'Опять это чувство несправедливости... Мне кажется, что мои усилия просто не замечают, сколько бы я ни работал.' },
  { id: 't5', timestamp: '0:30', speaker: 'Психолог', text: 'Это звучит очень изматывающе. Давайте попробуем разобрать эту ситуацию через призму того, о чем мы говорили в прошлый раз.' },
  { id: 't6', timestamp: '0:38', speaker: 'Пациент', text: 'Да, я пытался вспомнить ваши слова про личные границы, но в моменте это было очень сложно применить.' },
  { id: 't7', timestamp: '0:45', speaker: 'Психолог', text: 'Это нормально. Изменение привычных паттернов поведения требует времени и практики. Главное, что вы это заметили.' },
];
