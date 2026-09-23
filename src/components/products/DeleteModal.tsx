'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Product } from '@/types/product';

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  product: Product | null;
  isLoading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  isLoading = false,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-950/50">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-100">Delete Product</h3>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-sm">
          Are you sure you want to delete <strong className="text-slate-200 font-semibold">&quot;{product.title}&quot;</strong>? This simulated action will remove it from the catalog.
        </p>

        <div className="flex items-center gap-3 w-full mt-6 pt-4 border-t border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 shadow-lg shadow-rose-600/20"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isLoading ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
