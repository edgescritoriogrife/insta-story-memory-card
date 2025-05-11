
import React from "react";

type SpotifyPlayerProps = {
  spotifyLink?: string;
};

export const SpotifyPlayer = ({ spotifyLink }: SpotifyPlayerProps) => {
  // Função para extrair o ID da faixa do link do Spotify
  const getSpotifyEmbedUrl = (spotifyLink?: string) => {
    if (!spotifyLink) return null;
    
    try {
      // Lida com diferentes formatos de URL do Spotify
      let trackId = '';
      
      if (spotifyLink.includes('/track/')) {
        trackId = spotifyLink.split('/track/')[1].split('?')[0];
      } else if (spotifyLink.includes('spotify:track:')) {
        trackId = spotifyLink.split('spotify:track:')[1];
      }
      
      if (!trackId) return null;
      
      // Retorna o formato de URL incorporado
      return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
    } catch (error) {
      console.error("Erro ao analisar link do Spotify:", error);
      return null;
    }
  };

  const embedUrl = getSpotifyEmbedUrl(spotifyLink);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="spotify-player">
      <iframe 
        src={embedUrl} 
        width="100%" 
        height="80" 
        frameBorder="0" 
        allowFullScreen 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        title="Spotify Player"
      ></iframe>
    </div>
  );
};
