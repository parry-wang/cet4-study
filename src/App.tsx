import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Vocabulary from '@/pages/Vocabulary';
import VocabStudy from '@/pages/VocabStudy';
import VocabQuiz from '@/pages/VocabQuiz';
import VocabReview from '@/pages/VocabReview';
import Listening from '@/pages/Listening';
import ListeningDetail from '@/pages/ListeningDetail';
import Reading from '@/pages/Reading';
import ReadingDetail from '@/pages/ReadingDetail';
import Writing from '@/pages/Writing';
import WritingDetail from '@/pages/WritingDetail';
import Papers from '@/pages/Papers';
import PaperExam from '@/pages/PaperExam';
import Mistakes from '@/pages/Mistakes';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/vocabulary/study" element={<VocabStudy />} />
          <Route path="/vocabulary/quiz" element={<VocabQuiz />} />
          <Route path="/vocabulary/review" element={<VocabReview />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/listening/:id" element={<ListeningDetail />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/reading/:id" element={<ReadingDetail />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/writing/:id" element={<WritingDetail />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/papers/exam/:id" element={<PaperExam />} />
          <Route path="/mistakes" element={<Mistakes />} />
        </Route>
      </Routes>
    </Router>
  );
}
