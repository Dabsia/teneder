import React, { useEffect, useRef, useState } from 'react'
import CompanyNav from '../../../components/OrganizationNav/OrganizationNav'
import { Avatar, CircularProgress } from '@mui/material'
import UploadFile from '../../../components/UploadFile/UploadFile'
import CustomBtn from '../../../components/CustomBtn/CustomBtn'
import './EditProfile.css'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { setOrganizationProfilePicture } from '../../../Redux/Organization/Action'

const EditProfile = () => {
    const dispatch = useDispatch()

    const user = useSelector(state => state.organization.user)

    const [userDetails, setUserDetails] = useState(user)

    const { token, organization_id } = user

    const [isLoading, setIsLoading] = useState(false)

    const [file, setFile] = useState(null)
    const [AadharCard, setAadharCard] = useState(null)
    const [panCard, setPanCard] = useState(null)


    const [profilePicture, setProfilePicture] = useState(null)


    const [organization_type, setOrganizationType] = useState(userDetails?.organization_type)
    const [no_of_employees, setNo_of_employees] = useState(userDetails?.no_of_employees)
    const [states, setStates] = useState([])

    const fetchOrgDetails = async (url, token) => {
        const headers = new Headers();

        if (token) {
            headers.append('Authorization', `${token}`);
        }

        const response = await fetch(url, { headers });
        const data = await response.json();
        setUserDetails(data)

        return data;

    };

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries/')
            .then(res => res.json()).
            then(data => setStates(data.data))
    }, [])

    // get profile picture
    useEffect(() => {
        fetch(`https://school-project-production-459d.up.railway.app/v15/profile/picture/organization/${organization_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(data => setProfilePicture(data))
    }, [organization_id, token])


    const {
        getValues,
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm({

        criteriaMode: "all",
        reValidateMode: "onSubmit",
        mode: "onChange",
    });

    // Get states
    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries/states', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "country": "India" })
        }).then(res => res.json()).then(data => setStates(data?.data?.states))
    }, [])





    // Update profile picture
    const pictureData = new FormData()

    const fileInputRef = useRef(null);
    const handleImageChange = async (e) => {
        const file = e.target.files;
        // setSelectedImage(file);
        if (file) {
            // const imageUrl = URL.createObjectURL(file[0]);
            const imageUrl = file[0]
            pictureData.append('profile_picture_org', imageUrl)
            pictureData.append('organization_id', organization_id)

            const res = await fetch('https://school-project-production-459d.up.railway.app/v15/profile/picture/organization', {
                method: 'post',
                headers: {
                    'Authorization': `${token}`
                },
                body: pictureData
            })
            const data = await res.json()

            if (res.ok) {
                dispatch(setOrganizationProfilePicture(imageUrl))
                toast.success('Picture uploaded successfuly', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                    hideProgressBar: true,
                });
                fetch(`https://school-project-production-459d.up.railway.app/v15/profile/picture/organization/${organization_id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json()).then(data => setProfilePicture(data))
            }

        }
    };


    const url = `https://school-project-production-459d.up.railway.app/v1/auth/view/organization/${organization_id}`

    const { data } = useSWR([url, token], () => fetchOrgDetails(url, token));


    // Update the user profile
    const updateUser = async () => {
        const info = getValues()
        info.no_of_employees = no_of_employees
        info.organization_type = organization_type


        // const regFormData = new FormData();

        // regFormData.append('name_of_organization', data?.name_of_organization)
        // regFormData.append('organization_website', data?.organization_website)
        // regFormData.append('address_one', data?.address_one)
        // regFormData.append('address_three', data?.address_three)
        // regFormData.append('address_two', data?.address_two)
        // regFormData.append('state', data?.state)
        // regFormData.append('city', data?.city)
        // regFormData.append('first_name', data?.first_name)
        // regFormData.append('last_name', data?.last_name)
        // regFormData.append('postal_code', data?.postal_code)
        // regFormData.append('job_title', data?.job_title)
        // regFormData.append('email', data?.email)
        // regFormData.append('confirm_email', data?.confirm_email)
        // regFormData.append('password', data?.password)
        // regFormData.append('confirm_password', data?.confirm_password)
        // regFormData.append('wallet_address', data?.wallet_address)
        // regFormData.append('public_address', data?.public_address)
        // regFormData.append('registration_number', data?.registration_number)
        // regFormData.append('contact_number', data?.contact_number)
        // regFormData.append('registration_certificate', file)
        // regFormData.append('aadhar_card', AadharCard)
        // regFormData.append('pan_card', panCard)


        try {
            setIsLoading(true)

            const res = await fetch(`https://school-project-production-459d.up.railway.app/v1/auth/update/${user.organization_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(info)
            })
            const data = await res.json()
            console.log(data)
            setIsLoading(false)

            if (res.ok) {
                toast.success('Successfully updated your profile', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                    hideProgressBar: true,

                });

            }
            else {
                toast.error('Something went wrong', {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                    hideProgressBar: true,

                });
            }
        }
        catch (err) {
            setIsLoading(false)
            console.log(err)
        }




    }


    // Set the default values to the data in localStorage
    useEffect(() => {
        setValue('name_of_organization', userDetails?.name_of_organization)
        setValue('organization_type', userDetails?.organization_type)
        setValue('registration_number', userDetails?.registration_number)
        setValue('no_of_employees', userDetails?.no_of_employees)
        setValue('address_one', userDetails?.address_one)
        setValue('address_two', userDetails?.address_two)
        setValue('address_three', userDetails?.address_three)
        setValue('organization_website', userDetails?.organization_website)
        setValue('postal_code', userDetails?.postal_code)
        setValue('state', userDetails?.state)
        setValue('city', userDetails?.city)
        setValue('public_address', userDetails?.public_address)
        setValue('first_name', userDetails?.first_name)
        setValue('last_name', userDetails?.last_name)
        setValue('email', userDetails?.email)
        // setValue('confirm_email', userDetails?.email)
        // setValue('password', 'admin')
        // setValue('confirm_password', 'admin')
        setValue('job_title', userDetails?.job_title)
        setValue('contact_number', userDetails?.contact_number)
        setValue('wallet_address', userDetails?.wallet_address)
    }, [setValue, userDetails])






    return (
        <div>
            <CompanyNav />
            <div className='editProfileContainer'>
                <div className='headContainer'>
                    <div className='middleProfileContainer'>
                        <div className='avatarContainer' >
                            {profilePicture ? <Avatar className='avatarImage' sx={{ height: "5rem", width: "5rem" }} src={profilePicture?.slice(-1).pop()?.imageUrl} /> :
                                <Avatar className='avatarImage' sx={{ height: "5rem", width: "5rem" }} />}
                            <input
                                id="imageInput"
                                type="file"
                                accept=".png, .jpg, .jpeg"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                className="imageInput"
                            />
                        </div>

                        <p className='editProfileName' >{userDetails?.name_of_organization}</p>
                        <p className='editProfileName'>Organization Tag</p>
                    </div>
                </div>
                <h2 className='editProfileInfo' >ORGANIZATION INFO</h2>
                <form onSubmit={handleSubmit(updateUser)}>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>{userDetails?.name_of_organization}</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('name_of_organization')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Organization Type</label>
                            </div>
                            <select className='inputTypeSelect'
                                onChange={(event) => setOrganizationType(event.target.value)}
                                value={organization_type}>
                                <option value='Private' >Private</option>
                                <option value='Government' >Government</option>
                            </select>
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Registration No.</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('registration_number')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>No. of Employees</label>
                            </div>
                            <select className='inputTypeSelect'
                                onChange={e => setNo_of_employees(e.target.value)}
                                value={no_of_employees}
                            >
                                <option value='20' >20</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>
                                <option value='500'>500</option>
                                <option value='1000'>1000</option>
                            </select>
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Postal Code</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('postal_code')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label> Organization Website</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('organization_website')} />
                        </div>
                    </div>

                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>City</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('city')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>State</label>
                            </div>
                            <select className='inputTypeSelect' {...register('state')}>
                                {
                                    states?.map((state, id) => (
                                        <option value={state?.name} key={id} >{state?.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Public Address</label>
                            </div>
                            <input className='inputTypeInput' type='text' maxLength={16} {...register('public_address')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label> Wallet Address</label>
                            </div>
                            <input className='inputTypeInput' type='text' maxLength={16} {...register('wallet_address')} />

                        </div>
                    </div>
                    <h2 className='editProfileInfo' >ACCOUNT HANDLER INFO </h2>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>First Name</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('first_name')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Last Name</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('last_name')} />
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Email</label>
                            </div>
                            <input className='inputTypeInput' type='email' {...register('email')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>GST Number</label>
                            </div>
                            <input placeholder="Enter GST Number" maxLength={16} className='inputTypeInput' type='text'{...register('contact_number')} />
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Job Title</label>
                            </div>
                            <input className='inputTypeInput' type='text' {...register('job_title')} />
                        </div>

                    </div>
                    <h2 className='editProfileInfo' >CHANGE PASSWORD </h2>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Email</label>
                            </div>
                            <input className='inputTypeInput' type='email' {...register('email')} />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Current Password</label>
                            </div>
                            <input className='inputTypeInput' type='password' />
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>New Password</label>
                            </div>
                            <input className='inputTypeInput' type='password' />
                        </div>
                        <div className='companyTypeInputContainer2'>
                            <div className='typeInput' >

                                <label>Re-enter New Password</label>
                            </div>
                            <input className='inputTypeInput' type='password' />
                        </div>
                    </div>
                    <h2 className='editProfileInfo' >DOCUMENTS</h2>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <UploadFile name={'Aadhar card'} setFile={setAadharCard} />

                        </div>
                        <div className='companyTypeInputContainer2'>

                            <UploadFile name={'Pan card'} setFile={setPanCard} />
                        </div>
                    </div>
                    <div className='companyBox' >

                        <div className='companyTypeInputContainer2'>
                            <UploadFile name={'Registration card'} setFile={setFile} />

                        </div>

                    </div>
                    <div className='confirmBtnContainer'>

                        <CustomBtn>{isLoading ? <CircularProgress color="primary" thickness={10} size={18} /> : 'Confirm Changes'}</CustomBtn>
                    </div>
                </form>
            </div>

        </div>
    )
}

export default EditProfile