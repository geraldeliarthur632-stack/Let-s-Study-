import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, GradeLevel } from '../../types';
import { GRADE_LABELS } from '../../data/curriculumData';
import { soundEffects } from '../../services/soundEffects';
import {
  ArrowLeft,
  Send,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  X,
  Lightbulb,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageBase64?: string;
  mimeType?: string;
  timestamp: number;
}

interface AITutorChatModeProps {
  user: UserProfile;
  onBack: () => void;
  onEarnPoints?: (points: number) => void;
}

const STORAGE_CHAT_KEY = 'estudahud_ai_tutor_chat_history_v1';

export const AITutorChatMode: React.FC<AITutorChatModeProps> = ({
  user,
  onBack,
  onEarnPoints,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: `Olá, ${user.name || 'Estudante'}! 🎓 Sou seu **Tutor de Aprendizado com IA**.\n\n` +
          `📸 Você pode **tirar foto** de qualquer página do seu livro, anotações do caderno ou lição de casa!\n\n` +
          `💡 **Como funciona?**\n` +
          `• Se for uma matéria para estudar: eu explico tudo tim-tim por tim-tim.\n` +
          `• Se for um dever ou tema de casa: eu **não dou a resposta pronta**, mas te explico o **passo a passo** de como pensar e resolver para você aprender de verdade!\n\n` +
          `Sobre o que vamos conversar hoje? Pode digitar, falar no microfone 🎙️ ou mandar uma foto!`,
        timestamp: Date.now(),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('estudahud_tutor_auto_speak') === 'true';
    } catch {
      return false;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Save chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Text-to-Speech handler
  const handleSpeak = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(msgId);

    // Clean markdown formatting for smoother TTS
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#/g, '')
      .replace(/•/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Image Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.playClick();
    setSelectedImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Voice Input (Speech Recognition)
  const toggleRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não é suportado pelo seu navegador.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        soundEffects.playClick();
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && !selectedImage) return;
    if (isLoading) return;

    soundEffects.playClick();

    const newMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: newMsgId,
      role: 'user',
      text: text || (selectedImage ? '📸 Analise esta foto da matéria/exercício para mim.' : ''),
      imageBase64: selectedImage || undefined,
      mimeType: selectedImage ? selectedImageMime : undefined,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    const curImage = selectedImage;
    const curMime = selectedImageMime;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
            imageBase64: m.imageBase64,
            mimeType: m.mimeType,
          })),
          grade: user.grade,
          userName: user.name || 'Estudante',
          imageBase64: curImage,
          mimeType: curMime,
          currentText: text,
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || 'Não consegui processar a resposta agora. Pode tentar novamente?';

      const aiMsgId = `model-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'model',
        text: aiReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      soundEffects.playCorrect();
      onEarnPoints?.(5);

      if (autoSpeakEnabled) {
        handleSpeak(aiReply, aiMsgId);
      }
    } catch (err) {
      console.error('Error sending message to AI Tutor:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'Tivemos uma pequena falha de conexão com a IA. Por favor, verifique sua internet e tente enviar novamente!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestion chips
  const quickSuggestions = [
    { label: '📸 Foto do caderno', prompt: 'Tirei uma foto do meu caderno de aula. Pode me explicar essa matéria?' },
    { label: '📝 Explicar tema de casa', prompt: 'Tenho uma questão do meu dever de casa. Como penso para resolver passo a passo?' },
    { label: '🔢 Dúvida de Matemática', prompt: 'Pode me explicar como fazer contas com números decimais e frações?' },
    { label: '🌿 Ciências / Biologia', prompt: 'Me explica de forma simples como funciona a cadeia alimentar e os seres vivos?' },
    { label: '📖 Dica de Português', prompt: 'Como diferenciar substantivo de adjetivo em uma frase?' },
  ];

  const handleClearChat = () => {
    if (confirm('Deseja limpar todo o histórico de conversa com o Tutor IA?')) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      const resetMsg: ChatMessage = {
        id: 'welcome-reset',
        role: 'model',
        text: `Conversa reiniciada! 🌟 Olá, ${user.name || 'Estudante'}! Como posso te ajudar a aprender hoje? Envie sua pergunta ou tire uma foto!`,
        timestamp: Date.now(),
      };
      setMessages([resetMsg]);
      localStorage.removeItem(STORAGE_CHAT_KEY);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* TOP BAR */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              soundEffects.playClick();
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition border border-slate-700/50"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-white leading-tight">Tutor IA</h2>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                  {GRADE_LABELS[user.grade]?.short || '6º Ano'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Explica matérias & dever de casa</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const next = !autoSpeakEnabled;
              setAutoSpeakEnabled(next);
              try {
                localStorage.setItem('estudahud_tutor_auto_speak', String(next));
              } catch {}
              soundEffects.playClick();
            }}
            className={`p-2 rounded-xl text-xs transition border ${
              autoSpeakEnabled
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
            title={autoSpeakEnabled ? 'Voz automática ativada' : 'Ativar voz automática da IA'}
          >
            {autoSpeakEnabled ? <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700/50 text-slate-400 transition"
            title="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PEDAGOGICAL NOTICE BANNER */}
      <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/80 border-b border-purple-800/30 px-3.5 py-2 flex items-center gap-2.5 text-[11px] text-purple-200 shrink-0">
        <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
        <p className="leading-tight">
          <span className="font-bold text-white">Método Pedagógico:</span> A IA explica fotos e conceitos. No tema de casa, ela ensina o <b>passo a passo</b> sem dar a resposta pronta para você aprender!
        </p>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} group`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs shadow-xs space-y-2 ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs border border-blue-500/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                {/* User Image Attachment */}
                {msg.imageBase64 && (
                  <div className="rounded-xl overflow-hidden border border-white/20 max-w-xs mb-2">
                    <img
                      src={msg.imageBase64}
                      alt="Material enviado"
                      className="w-full h-auto max-h-56 object-cover bg-black/40"
                    />
                  </div>
                )}

                {/* Message Text with Paragraph / Bullet formatting */}
                <div className="space-y-2 leading-relaxed whitespace-pre-wrap select-text">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => {
                    // Check if it's bullet list
                    if (paragraph.startsWith('•') || paragraph.startsWith('-') || paragraph.includes('\n•') || paragraph.includes('\n-')) {
                      const lines = paragraph.split('\n');
                      return (
                        <div key={pIdx} className="space-y-1 my-1">
                          {lines.map((line, lIdx) => (
                            <div key={lIdx} className="flex items-start gap-1.5">
                              <span className="text-purple-400 font-bold">•</span>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: line
                                    .replace(/^[•-]\s*/, '')
                                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'),
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <p
                        key={pIdx}
                        dangerouslySetInnerHTML={{
                          __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'),
                        }}
                      />
                    );
                  })}
                </div>

                {/* Model Message Footer / Audio Player */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => handleSpeak(msg.text, msg.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                        isSpeaking
                          ? 'bg-purple-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-white' : 'text-purple-400'}`} />
                      <span>{isSpeaking ? 'Parar Áudio' : 'Ouvir Explicação'}</span>
                    </button>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator Bubble */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-xs p-3.5 text-xs text-slate-300 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-purple-300 font-medium">Tutor IA analisando e formulando a melhor explicação...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION CHIPS (if messages are few or user wants ideas) */}
      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          Sugestões:
        </span>
        {quickSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700/60 text-[11px] whitespace-nowrap shrink-0 transition active:scale-95 disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* IMAGE PREVIEW BEFORE SENDING */}
      {selectedImage && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-purple-500/50 bg-black shrink-0">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Foto anexada com sucesso! 📸</p>
              <p className="text-[10px] text-slate-400">Escreva sua dúvida ou envie para a IA explicar.</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
            title="Remover foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BOTTOM INPUT BAR */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* CAMERA BUTTON */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-700/60 rounded-xl transition active:scale-95 disabled:opacity-50 shrink-0"
            title="Tirar foto da matéria com a câmera"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* GALLERY UPLOAD BUTTON */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 hover:bg-purple-950/60 text-slate-300 hover:text-purple-300 border border-slate-700/60 rounded-xl transition active:scale-95 disabled:opacity-50 shrink-0"
            title="Escolher foto da galeria"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* VOICE INPUT BUTTON */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isLoading}
            className={`p-2.5 border rounded-xl transition active:scale-95 disabled:opacity-50 shrink-0 ${
              isRecording
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
            }`}
            title={isRecording ? 'Parar gravação de voz' : 'Falar pergunta no microfone'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* TEXT INPUT FIELD */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Ouvindo sua voz...'
                : selectedImage
                ? 'O que você gostaria que a IA explique sobre a foto?'
                : 'Pergunte ou peça para explicar...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden transition"
          />

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
            title="Enviar mensagem"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
