const ShopLocationMap = () => {
  return (
    <div className="w-full h-48 rounded-lg overflow-hidden border border-outline-variant/30 mt-4 shadow-sm">
      <iframe
        src="https://www.google.com/maps?q=Th%E1%BB%8B%20tr%E1%BA%A5n%20Lim,%20Ti%C3%AAn%20Du,%20B%E1%BA%AFc%20Ninh&output=embed"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Bản đồ vị trí trại cá FishSync"
      ></iframe>
    </div>
  );
};

export default ShopLocationMap;