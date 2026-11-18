'use client';
import { redirect } from 'next/navigation';

/** «Миний үр дүн» — самбарын тестийн түүх рүү чиглүүлнэ. */
export default function HistoryRedirect() { redirect('/profile'); }
