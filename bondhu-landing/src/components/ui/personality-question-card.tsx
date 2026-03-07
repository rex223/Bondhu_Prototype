"use client"

import { motion } from "framer-motion"
import { PersonalityQuestion } from "@/types/personality"
import { PersonalitySlider } from "./personality-slider"
import { cn } from "@/lib/utils"
import { Check, MessageSquareQuote } from "lucide-react"

interface PersonalityQuestionCardProps {
  question: PersonalityQuestion
  questionIndex: number
  totalQuestions: number
  onResponseChange: (questionId: number, response: number) => void
  className?: string
}

export function PersonalityQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onResponseChange,
  className
}: PersonalityQuestionCardProps) {
  const handleResponseChange = (response: number) => {
    onResponseChange(question.id, response)
  }

  const isAnswered = question.userResponse !== undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: questionIndex * 0.08 }}
      className={cn(
        "relative overflow-hidden rounded-xl sm:rounded-2xl",
        "bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
        "border border-white/30 dark:border-white/10",
        "p-4 sm:p-5 space-y-4 sm:space-y-5",
        "transition-all duration-300",
        isAnswered && "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10",
        className
      )}
    >
      {/* Answered indicator glow */}
      {isAnswered && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Question Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold transition-all",
            isAnswered 
              ? "bg-emerald-500 text-white" 
              : "bg-gray-100 dark:bg-gray-700 text-muted-foreground"
          )}>
            {isAnswered ? <Check className="w-4 h-4" /> : questionIndex + 1}
          </span>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            of {totalQuestions}
          </span>
        </div>
        
        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300",
                i < questionIndex 
                  ? "bg-emerald-500" 
                  : i === questionIndex
                    ? "bg-primary w-3 sm:w-4"
                    : "bg-gray-200 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
      </div>

      {/* Scenario Text */}
      <div className="relative">
        <div className="flex gap-3 p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border-l-3 border-primary/50">
          <MessageSquareQuote className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
            {question.scenario}
          </p>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground leading-relaxed">
        {question.questionText}
      </h3>

      {/* Response Slider */}
      <div className="pt-1">
        <PersonalitySlider
          value={question.userResponse}
          onValueChange={handleResponseChange}
          questionId={question.id}
        />
      </div>

      {/* Response Feedback */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
            className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </motion.div>
          <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            Response recorded
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}



