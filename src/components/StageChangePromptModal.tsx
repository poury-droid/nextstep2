import React from 'react';
import { ApplicationStage, Application } from '../types/index.ts';
import { IconMessageSquare, IconFileText, IconSparkles, IconX, IconArrowRight } from './Icons.tsx';

interface StageChangePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  targetStage: ApplicationStage;
  onOpenNoticeRegister: (stage: ApplicationStage, preferredType: 'sms' | 'document') => void;
}

export const StageChangePromptModal: React.FC<StageChangePromptModalProps> = ({
  isOpen,
  onClose,
  application,
  targetStage,
  onOpenNoticeRegister,
}) => {
  if (!isOpen) return null;

  const isDocPassed = targetStage === '서류합격';
  const isInterviewPassed = targetStage === '1차면접' || targetStage === '2차/최종면접';
  const isFinalPass = targetStage === '최종합격';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <IconX className="w-4 h-4" />
        </button>

        {/* Celebration Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <IconSparkles className="w-8 h-8 animate-bounce" />
        </div>

        {/* Title */}
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          {application.company} • {targetStage} 달성!
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {isDocPassed && '🎉 서류 전형 합격을 축하합니다!'}
          {isInterviewPassed && '🎉 면접 전형 통과를 축하합니다!'}
          {isFinalPass && '🏆 최종 합격을 진심으로 축하합니다!'}
          {!isDocPassed && !isInterviewPassed && !isFinalPass && `[${targetStage}] 단계로 전형이 변경되었습니다.`}
        </h3>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {isDocPassed && (
            <>
              채용팀에서 수신한 <span className="font-bold text-slate-900">면접 안내 문자(SMS/알림톡)</span>나 캡처 사진을 지금 바로 등록하시겠습니까? 면접 일시와 장소가 캘린더에 자동 연동됩니다.
            </>
          )}
          {isInterviewPassed && (
            <>
              수신한 <span className="font-bold text-slate-900">최종면접 안내문(또는 2차 면접 문자)</span>을 올려두시면 언제든 원본 내용과 장소를 한눈에 확인하고 대비할 수 있습니다.
            </>
          )}
          {isFinalPass && (
            <>
              최종 입사 안내문, 건강검진 안내, 또는 처우 협의 문서를 등록하여 입사 준비를 체계적으로 관리하세요.
            </>
          )}
          {!isDocPassed && !isInterviewPassed && !isFinalPass && (
            <>
              이 단계에 대한 수신 문자나 안내문이 있다면 지금 보관함에 등록해 두세요.
            </>
          )}
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (isDocPassed) {
                onOpenNoticeRegister('서류합격', 'sms');
              } else if (isInterviewPassed) {
                onOpenNoticeRegister(targetStage, 'document');
              } else {
                onOpenNoticeRegister(targetStage, 'document');
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
          >
            {isDocPassed ? (
              <>
                <IconMessageSquare className="w-4 h-4" />
                <span>면접 안내 문자(SMS) 바로 등록하기</span>
              </>
            ) : (
              <>
                <IconFileText className="w-4 h-4" />
                <span>최종면접 안내문 바로 올리기</span>
              </>
            )}
            <IconArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            나중에 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};
