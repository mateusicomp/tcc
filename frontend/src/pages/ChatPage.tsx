import { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ArrowLeft, Send, Trash2, Bot, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { sendChat, type Role } from "../services/aiService";
import { motion, AnimatePresence } from "motion/react";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatPage() {
  const history = useHistory();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o assistente do AquaMonitor. Como posso ajudá-lo hoje? Posso responder dúvidas sobre consumo de água, energia, sensores e muito mais!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Sugestões de perguntas rápidas
  const quickQuestions = [
    "Qual meu consumo médio?",
    "Como economizar água?",
    "Qual o status da bomba?",
    "Gerar relatório",
  ];

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 160;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }

  function handleComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(); 
    }
  }
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Adiciona mensagem do usuário (mantive igual)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Chamada real ao backend de IA
    try {
      // Histórico no formato aceito pelo serviço (inclui system)
      const historyForLLM: { role: Role; content: string }[] = [
        { role: "system", content: "Você é um assistente do AquaMonitor." },
        ...messages.map(m => ({ role: m.role as Role, content: m.content })),
        { role: "user", content: userMessage.content },
      ];

      const res = await sendChat(historyForLLM, sessionId);
      if (res.session_id && !sessionId) setSessionId(res.session_id);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Erro ao consultar o assistente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleClearChat = () => {
    if (confirm("Deseja limpar todo o histórico de conversa?")) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Olá! Sou o assistente do AquaMonitor. Como posso ajudá-lo hoje?",
          timestamp: new Date(),
        },
      ]);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => history.push("/home")}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl text-slate-800">Assistente IA</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm text-slate-500">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClearChat} className="shrink-0">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Perguntas Rápidas */}
      {messages.length <= 1 && (
        <div className="mb-4 shrink-0">
          <p className="text-sm text-slate-600 mb-2">Perguntas rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-purple-600 to-purple-700"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Mensagem */}
              <Card
                className={`p-3 max-w-[80%] ${
                  message.role === "user" ? "bg-blue-600 text-white border-blue-600" : "bg-white"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Indicador de digitação */}
        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card className="p-3 bg-white">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem (auto-resize + multiline) */}
      <div className="shrink-0 flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              autoGrow();
            }}
            onKeyDown={handleComposerKeyDown}
            placeholder="Digite sua pergunta..."
            rows={1}
            // estilização: sem resize manual, sem bordas “feias”, tipografia igual ao Input
            className="
              w-full
              rounded-md border border-slate-300 bg-white
              px-3 py-2 text-sm leading-5
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50
              resize-none overflow-hidden
            "
            disabled={isTyping}
            aria-label="Campo de mensagem"
          />
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
}
