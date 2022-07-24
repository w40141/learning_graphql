const mutation = {
  postPhoto(parent: String, args: any) {
    const newPhoto = {
      id: _id++,
      ...args.input,
      created: new Date(),
    };
    photos.push(newPhoto);
    return newPhoto;
  },
};

export default mutation;
