'use client';

import {useState, useEffect, useRef} from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';

interface UseCollectionOptions<T> {
  onData?: (data: T[]) => void;
  onError?: (error: FirestoreError) => void;
}

export function useCollection<T>(
  query: Query<DocumentData> | null,
  options: UseCollectionOptions<T> = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const {onData, onError} = options;

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: T[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(result);
        if (onData) onData(result);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error(`Error fetching collection:`, err);
        setError(err);
        if (onError) onError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [JSON.stringify(query)]);

  return {data, loading, error};
}
