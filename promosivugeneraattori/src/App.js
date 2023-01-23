import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Autorisointi from './autorisointi';
import Lomake from './lomake';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Autorisointi />} />
        <Route path="lomake" element={<Lomake />} />
      </Routes>
    </BrowserRouter>
  );
}