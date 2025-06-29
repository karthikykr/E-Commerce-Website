'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true,
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-gray-200 ${roundedClasses[rounded]}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
      style={style}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <Skeleton height={200} rounded="none" />
      <div className="p-4 space-y-3">
        <Skeleton height={20} width="80%" />
        <Skeleton height={16} width="60%" />
        <div className="flex justify-between items-center">
          <Skeleton height={20} width={80} />
          <Skeleton height={36} width={100} rounded="lg" />
        </div>
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Cart Item Skeleton
export const CartItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
      <Skeleton width={80} height={80} rounded="lg" />
      <div className="flex-1 space-y-2">
        <Skeleton height={20} width="70%" />
        <Skeleton height={16} width="50%" />
        <div className="flex justify-between items-center">
          <Skeleton height={16} width={60} />
          <Skeleton height={32} width={100} rounded="lg" />
        </div>
      </div>
    </div>
  );
};

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton height={32} width="40%" />
      <Skeleton height={20} width="60%" />
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton width={80} height={80} rounded="full" />
        <div className="space-y-2">
          <Skeleton height={24} width={200} />
          <Skeleton height={16} width={150} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton height={16} width={80} />
            <Skeleton height={40} />
          </div>
          <div className="space-y-2">
            <Skeleton height={16} width={80} />
            <Skeleton height={40} />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton height={16} width={80} />
          <Skeleton height={40} />
        </div>
        <Skeleton height={44} width={120} rounded="lg" />
      </div>
    </div>
  );
};

// Order History Skeleton
export const OrderHistorySkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <Skeleton height={20} width={120} />
              <Skeleton height={16} width={100} />
            </div>
            <Skeleton height={24} width={80} rounded="full" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton width={50} height={50} rounded="lg" />
              <div className="flex-1 space-y-1">
                <Skeleton height={16} width="60%" />
                <Skeleton height={14} width="40%" />
              </div>
              <Skeleton height={16} width={60} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <Skeleton height={20} width={100} />
            <Skeleton height={36} width={120} rounded="lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
