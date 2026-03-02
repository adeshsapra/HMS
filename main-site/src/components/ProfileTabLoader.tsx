interface ProfileTabLoaderProps {
  message?: string
}

const ProfileTabLoader = ({ message = 'Loading...' }: ProfileTabLoaderProps) => {
  return (
    <div className="profile-tab-loader-wrap" role="status" aria-live="polite">
      <style>{`
        .profile-tab-loader-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
        .profile-tab-spin-loader {
          width: 45px;
          height: 45px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #049EBB;
          border-radius: 50%;
          animation: profile-tab-spin 1s linear infinite;
        }
        .profile-tab-loader-text {
          margin-top: 0.75rem;
          color: #6c757d;
        }
        @keyframes profile-tab-spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="profile-tab-spin-loader"></div>
      <p className="profile-tab-loader-text mb-0">{message}</p>
    </div>
  )
}

export default ProfileTabLoader
