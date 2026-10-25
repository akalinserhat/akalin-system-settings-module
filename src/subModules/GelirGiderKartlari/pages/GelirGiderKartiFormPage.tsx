import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GelirGiderKartiForm from '../components/GelirGiderKartiForm';

const GelirGiderKartiFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <GelirGiderKartiForm
            id={id}
            onSuccess={() => navigate(-1)}
            onCancel={() => navigate(-1)}
            asForm={true}
        />
    );
};

export default GelirGiderKartiFormPage;
