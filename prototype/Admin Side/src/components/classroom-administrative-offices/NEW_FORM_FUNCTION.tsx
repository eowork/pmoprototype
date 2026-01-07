// ====================================================================================
// NEW CLASSROOM ASSESSMENT FORM WITH WEIGHTED SCORING
// Replace lines 1158-1973 in ClassroomAssessmentPage.tsx with this entire function
// ====================================================================================

// Classroom Assessment Form Component - Redesigned with Weighted Scoring System
function ClassroomAssessmentForm({ onFormSubmit, colleges, campuses }: {
  onFormSubmit: (data: any) => void;
  colleges: any[];
  campuses: string[];
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customRoomType, setCustomRoomType] = useState('');
  
  const [formData, setFormData] = useState<ClassroomAssessmentFormData>({
    // Basic Information
    buildingName: '',
    roomNumber: '',
    subject: '',
    roomType: 'Lecture',
    customRoomType: '',
    college: 'CED - College of Education',
    campus: 'CSU Main Campus',
    semester: 'First Semester',
    academicYear: '2023-2024',
    numberOfStudents: '',
    schedule: '',
    dateOfAssessment: '',
    assessor: '',
    position: '',

    // Assessment Categories - All with rating and remarks
    accessibility: {
      pwdFriendlyFacilities: { rating: 1, remarks: '' },
      roomAccessibility: { rating: 1, remarks: '' },
      directionalSignages: { rating: 1, remarks: '' },
      pathways: { rating: 1, remarks: '' }
    },
    functionality: {
      flexibility: { rating: 1, remarks: '' },
      ventilation: { rating: 1, remarks: '' },
      noiseLevel: { rating: 1, remarks: '' }
    },
    utility: {
      electricity: { rating: 1, remarks: '' },
      lighting: { rating: 1, remarks: '' },
      internetConnectivity: { rating: 1, remarks: '' }
    },
    sanitation: {
      cleanliness: { rating: 1, remarks: '' },
      wasteDisposal: { rating: 1, remarks: '' },
      odor: { rating: 1, remarks: '' },
      comfortRoomAccess: { rating: 1, remarks: '' }
    },
    equipment: {
      projectorTvMonitorSpeakersMic: { rating: 1, remarks: '' }
    },
    furnitureFixtures: {
      chairsDesks: { rating: 1, remarks: '' },
      neutralDesk: { rating: 1, remarks: '' },
      teachersTablePodium: { rating: 1, remarks: '' },
      whiteboardBlackboard: { rating: 1, remarks: '' }
    },
    space: {
      roomCapacity: { rating: 1, remarks: '' },
      layout: { rating: 1, remarks: '' },
      storage: { rating: 1, remarks: '' }
    },
    disasterPreparedness: {
      emergencyExitsFireSafety: { rating: 1, remarks: '' },
      earthquakePreparedness: { rating: 1, remarks: '' },
      floodSafety: { rating: 1, remarks: '' },
      safetySignages: { rating: 1, remarks: '' }
    },
    inclusivity: {
      privacyInComfortRooms: { rating: 1, remarks: '' },
      genderNeutralRestrooms: { rating: 1, remarks: '' },
      safeSpaces: { rating: 1, remarks: '' },
      classroomAssignmentSpecialNeeds: { rating: 1, remarks: '' }
    },

    // General Remarks
    remarks: '',
    recommendingActions: ''
  });

  // Form steps configuration
  const formSteps = [
    { number: 1, title: 'Basic Information', icon: School },
    { number: 2, title: 'Accessibility', subtitle: '15% Weight' },
    { number: 3, title: 'Functionality', subtitle: '15% Weight' },
    { number: 4, title: 'Utility', subtitle: '10% Weight' },
    { number: 5, title: 'Sanitation', subtitle: '10% Weight' },
    { number: 6, title: 'Equipment', subtitle: '10% Weight' },
    { number: 7, title: 'Furniture & Fixtures', subtitle: '10% Weight' },
    { number: 8, title: 'Space', subtitle: '15% Weight' },
    { number: 9, title: 'Disaster Preparedness', subtitle: '10% Weight' },
    { number: 10, title: 'Inclusivity', subtitle: '5% Weight' },
    { number: 11, title: 'Assessment Summary' }
  ];

  const handleNext = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRatingChange = (category: string, item: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [item]: {
          ...(prev[category as keyof typeof prev] as any)[item],
          rating
        }
      }
    }));
  };

  const handleRemarksChange = (category: string, item: string, remarks: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [item]: {
          ...(prev[category as keyof typeof prev] as any)[item],
          remarks
        }
      }
    }));
  };

  const handleSubmit = () => {
    // Calculate all scores
    const allCategoryScores = calculateAllCategoryScores(formData);
    const overallWeightedScore = calculateOverallWeightedScore(allCategoryScores);
    const overallCondition = getOverallCondition(overallWeightedScore);

    const assessmentData = {
      ...formData,
      roomType: formData.roomType === 'Others' ? customRoomType : formData.roomType,
      overallWeightedScore,
      overallCondition,
      categoryScores: allCategoryScores
    };

    onFormSubmit(assessmentData);

    // Reset form
    setCurrentStep(1);
    setCustomRoomType('');
    setFormData({
      buildingName: '',
      roomNumber: '',
      subject: '',
      roomType: 'Lecture',
      customRoomType: '',
      college: 'CED - College of Education',
      campus: 'CSU Main Campus',
      semester: 'First Semester',
      academicYear: '2023-2024',
      numberOfStudents: '',
      schedule: '',
      dateOfAssessment: '',
      assessor: '',
      position: '',
      accessibility: {
        pwdFriendlyFacilities: { rating: 1, remarks: '' },
        roomAccessibility: { rating: 1, remarks: '' },
        directionalSignages: { rating: 1, remarks: '' },
        pathways: { rating: 1, remarks: '' }
      },
      functionality: {
        flexibility: { rating: 1, remarks: '' },
        ventilation: { rating: 1, remarks: '' },
        noiseLevel: { rating: 1, remarks: '' }
      },
      utility: {
        electricity: { rating: 1, remarks: '' },
        lighting: { rating: 1, remarks: '' },
        internetConnectivity: { rating: 1, remarks: '' }
      },
      sanitation: {
        cleanliness: { rating: 1, remarks: '' },
        wasteDisposal: { rating: 1, remarks: '' },
        odor: { rating: 1, remarks: '' },
        comfortRoomAccess: { rating: 1, remarks: '' }
      },
      equipment: {
        projectorTvMonitorSpeakersMic: { rating: 1, remarks: '' }
      },
      furnitureFixtures: {
        chairsDesks: { rating: 1, remarks: '' },
        neutralDesk: { rating: 1, remarks: '' },
        teachersTablePodium: { rating: 1, remarks: '' },
        whiteboardBlackboard: { rating: 1, remarks: '' }
      },
      space: {
        roomCapacity: { rating: 1, remarks: '' },
        layout: { rating: 1, remarks: '' },
        storage: { rating: 1, remarks: '' }
      },
      disasterPreparedness: {
        emergencyExitsFireSafety: { rating: 1, remarks: '' },
        earthquakePreparedness: { rating: 1, remarks: '' },
        floodSafety: { rating: 1, remarks: '' },
        safetySignages: { rating: 1, remarks: '' }
      },
      inclusivity: {
        privacyInComfortRooms: { rating: 1, remarks: '' },
        genderNeutralRestrooms: { rating: 1, remarks: '' },
        safeSpaces: { rating: 1, remarks: '' },
        classroomAssignmentSpecialNeeds: { rating: 1, remarks: '' }
      },
      remarks: '',
      recommendingActions: ''
    });

    toast.success('Classroom assessment submitted successfully!');
  };

  const ROOM_TYPES = ['Lecture', 'Laboratory', 'Seminar Room', 'Others'];
  const SEMESTERS = ['First Semester', 'Second Semester', 'Summer'];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormSection 
            title="Classroom Identification" 
            description="Please provide the basic information about the classroom being assessed"
            required
          >
            <FormGrid columns={3}>
              <FormField label="Building Name" required>
                <Input
                  value={formData.buildingName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buildingName: e.target.value }))}
                  placeholder="Enter building name"
                  className="h-11"
                />
              </FormField>
              
              <FormField label="Room Number" required>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="Enter room number"
                  className="h-11"
                />
              </FormField>
              
              <FormField label="Subject" required>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject"
                  className="h-11"
                />
              </FormField>
            </FormGrid>

            <FormSection title="Room Classification" description="Specify the type and purpose of the classroom">
              <div className="space-y-4">
                <FormField label="Room Type" required>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ROOM_TYPES.map((type) => (
                        <label key={type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            value={type}
                            checked={formData.roomType === type}
                            onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value }))}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-slate-700">{type}</span>
                        </label>
                      ))}
                    </div>
                    
                    {formData.roomType === 'Others' && (
                      <Input
                        value={customRoomType}
                        onChange={(e) => setCustomRoomType(e.target.value)}
                        placeholder="Please specify room type"
                        className="h-11"
                      />
                    )}
                  </div>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Academic Details" description="Provide class and schedule information">
              <FormGrid columns={3}>
                <FormField label="College" required>
                  <Select value={formData.college} onValueChange={(value) => setFormData(prev => ({ ...prev, college: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.code} value={`${college.code} - ${college.name}`}>
                          {college.code} - {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Campus" required>
                  <Select value={formData.campus} onValueChange={(value) => setFormData(prev => ({ ...prev, campus: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Semester" required>
                  <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((semester) => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Academic Year" required>
                  <Input
                    value={formData.academicYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                    placeholder="e.g. 2023-2024"
                    className="h-11"
                  />
                </FormField>

                <FormField label="Number of Students" required>
                  <Input
                    type="number"
                    value={formData.numberOfStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfStudents: e.target.value }))}
                    placeholder="Enter number"
                    className="h-11"
                  />
                </FormField>

                <FormField label="Schedule" required>
                  <Input
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="e.g. MWF 8:00-9:00 AM"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Assessor Information" description="Details of the person conducting the assessment">
              <FormGrid columns={3}>
                <FormField label="Date of Assessment" required>
                  <Input
                    type="date"
                    value={formData.dateOfAssessment}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfAssessment: e.target.value }))}
                    className="h-11"
                  />
                </FormField>

                <FormField label="Assessor Name" required>
                  <Input
                    value={formData.assessor}
                    onChange={(e) => setFormData(prev => ({ ...prev, assessor: e.target.value }))}
                    placeholder="Enter assessor name"
                    className="h-11"
                  />
                </FormField>

                <FormField label="Position" required>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g. Department Head"
                    className="h-11"
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </FormSection>
        );

      case 2:
        // Accessibility - 15% Weight
        const accessibilityScore = calculateAllCategoryScores(formData)[0];
        return (
          <FormSection 
            title="Accessibility Assessment" 
            description="Evaluate classroom accessibility features and compliance with RA 7277"
          >
            <WeightedScoreCard
              categoryName={accessibilityScore.name}
              totalRating={accessibilityScore.totalRating}
              maxPossibleScore={accessibilityScore.maxPossibleScore}
              categoryScore={accessibilityScore.categoryScore}
              weight={accessibilityScore.weight}
              weightedScore={accessibilityScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="PWD-Friendly Facilities"
              description="CR has grab bars, ramp, wide entry, etc. (RA 7277)"
              rating={formData.accessibility.pwdFriendlyFacilities.rating}
              remarks={formData.accessibility.pwdFriendlyFacilities.remarks}
              onRatingChange={(rating) => handleRatingChange('accessibility', 'pwdFriendlyFacilities', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('accessibility', 'pwdFriendlyFacilities', remarks)}
            />

            <RatingSectionWithRemarks
              title="Room Accessibility"
              description="Space is easy to access for students and faculty"
              rating={formData.accessibility.roomAccessibility.rating}
              remarks={formData.accessibility.roomAccessibility.remarks}
              onRatingChange={(rating) => handleRatingChange('accessibility', 'roomAccessibility', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('accessibility', 'roomAccessibility', remarks)}
            />

            <RatingSectionWithRemarks
              title="Directional Signages"
              description="Clear and visible room labels, directional signs"
              rating={formData.accessibility.directionalSignages.rating}
              remarks={formData.accessibility.directionalSignages.remarks}
              onRatingChange={(rating) => handleRatingChange('accessibility', 'directionalSignages', rating)}
              onRemarksChange((remarks) => handleRemarksChange('accessibility', 'directionalSignages', remarks)}
            />

            <RatingSectionWithRemarks
              title="Pathways"
              description="Corridors and entrances free from obstructions, slip-resistant flooring"
              rating={formData.accessibility.pathways.rating}
              remarks={formData.accessibility.pathways.remarks}
              onRatingChange={(rating) => handleRatingChange('accessibility', 'pathways', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('accessibility', 'pathways', remarks)}
            />
          </FormSection>
        );

      case 3:
        // Functionality - 15% Weight
        const functionalityScore = calculateAllCategoryScores(formData)[1];
        return (
          <FormSection 
            title="Functionality Assessment" 
            description="Assess classroom functionality and environmental conditions"
          >
            <WeightedScoreCard
              categoryName={functionalityScore.name}
              totalRating={functionalityScore.totalRating}
              maxPossibleScore={functionalityScore.maxPossibleScore}
              categoryScore={functionalityScore.categoryScore}
              weight={functionalityScore.weight}
              weightedScore={functionalityScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Flexibility"
              description="Furniture or layout adaptable for group work, discussions, or exams"
              rating={formData.functionality.flexibility.rating}
              remarks={formData.functionality.flexibility.remarks}
              onRatingChange={(rating) => handleRatingChange('functionality', 'flexibility', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('functionality', 'flexibility', remarks)}
            />

            <RatingSectionWithRemarks
              title="Ventilation"
              description="Natural/mechanical ventilation working"
              rating={formData.functionality.ventilation.rating}
              remarks={formData.functionality.ventilation.remarks}
              onRatingChange={(rating) => handleRatingChange('functionality', 'ventilation', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('functionality', 'ventilation', remarks)}
            />

            <RatingSectionWithRemarks
              title="Noise Level"
              description="Minimal external noise"
              rating={formData.functionality.noiseLevel.rating}
              remarks={formData.functionality.noiseLevel.remarks}
              onRatingChange={(rating) => handleRatingChange('functionality', 'noiseLevel', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('functionality', 'noiseLevel', remarks)}
            />
          </FormSection>
        );

      case 4:
        // Utility - 10% Weight
        const utilityScore = calculateAllCategoryScores(formData)[2];
        return (
          <FormSection 
            title="Utility Assessment" 
            description="Evaluate utility services and infrastructure"
          >
            <WeightedScoreCard
              categoryName={utilityScore.name}
              totalRating={utilityScore.totalRating}
              maxPossibleScore={utilityScore.maxPossibleScore}
              categoryScore={utilityScore.categoryScore}
              weight={utilityScore.weight}
              weightedScore={utilityScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Electricity"
              description="Working outlets, switches, safe wiring"
              rating={formData.utility.electricity.rating}
              remarks={formData.utility.electricity.remarks}
              onRatingChange={(rating) => handleRatingChange('utility', 'electricity', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('utility', 'electricity', remarks)}
            />

            <RatingSectionWithRemarks
              title="Lighting"
              description="Adequate natural/artificial lighting"
              rating={formData.utility.lighting.rating}
              remarks={formData.utility.lighting.remarks}
              onRatingChange={(rating) => handleRatingChange('utility', 'lighting', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('utility', 'lighting', remarks)}
            />

            <RatingSectionWithRemarks
              title="Internet Connectivity"
              description="Stable signal/reception (if applicable)"
              rating={formData.utility.internetConnectivity.rating}
              remarks={formData.utility.internetConnectivity.remarks}
              onRatingChange={(rating) => handleRatingChange('utility', 'internetConnectivity', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('utility', 'internetConnectivity', remarks)}
            />
          </FormSection>
        );

      case 5:
        // Sanitation - 10% Weight
        const sanitationScore = calculateAllCategoryScores(formData)[3];
        return (
          <FormSection 
            title="Sanitation Assessment" 
            description="Evaluate cleanliness and hygiene standards"
          >
            <WeightedScoreCard
              categoryName={sanitationScore.name}
              totalRating={sanitationScore.totalRating}
              maxPossibleScore={sanitationScore.maxPossibleScore}
              categoryScore={sanitationScore.categoryScore}
              weight={sanitationScore.weight}
              weightedScore={sanitationScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Cleanliness"
              description="Floors, walls, windows clean"
              rating={formData.sanitation.cleanliness.rating}
              remarks={formData.sanitation.cleanliness.remarks}
              onRatingChange={(rating) => handleRatingChange('sanitation', 'cleanliness', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('sanitation', 'cleanliness', remarks)}
            />

            <RatingSectionWithRemarks
              title="Waste Disposal"
              description="Availability of trash bins"
              rating={formData.sanitation.wasteDisposal.rating}
              remarks={formData.sanitation.wasteDisposal.remarks}
              onRatingChange={(rating) => handleRatingChange('sanitation', 'wasteDisposal', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('sanitation', 'wasteDisposal', remarks)}
            />

            <RatingSectionWithRemarks
              title="Odor"
              description="Room free from foul odor"
              rating={formData.sanitation.odor.rating}
              remarks={formData.sanitation.odor.remarks}
              onRatingChange={(rating) => handleRatingChange('sanitation', 'odor', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('sanitation', 'odor', remarks)}
            />

            <RatingSectionWithRemarks
              title="Comfort Room Access"
              description="Accessible CRs within reasonable distance"
              rating={formData.sanitation.comfortRoomAccess.rating}
              remarks={formData.sanitation.comfortRoomAccess.remarks}
              onRatingChange={(rating) => handleRatingChange('sanitation', 'comfortRoomAccess', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('sanitation', 'comfortRoomAccess', remarks)}
            />
          </FormSection>
        );

      case 6:
        // Equipment - 10% Weight
        const equipmentScore = calculateAllCategoryScores(formData)[4];
        return (
          <FormSection 
            title="Equipment Assessment" 
            description="Evaluate teaching and learning equipment"
          >
            <WeightedScoreCard
              categoryName={equipmentScore.name}
              totalRating={equipmentScore.totalRating}
              maxPossibleScore={equipmentScore.maxPossibleScore}
              categoryScore={equipmentScore.categoryScore}
              weight={equipmentScore.weight}
              weightedScore={equipmentScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Projector / TV / Monitor / Speakers / Mic (If applicable)"
              description="Available and functional"
              rating={formData.equipment.projectorTvMonitorSpeakersMic.rating}
              remarks={formData.equipment.projectorTvMonitorSpeakersMic.remarks}
              onRatingChange={(rating) => handleRatingChange('equipment', 'projectorTvMonitorSpeakersMic', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('equipment', 'projectorTvMonitorSpeakersMic', remarks)}
            />
          </FormSection>
        );

      case 7:
        // Furniture and Fixtures - 10% Weight
        const furnitureScore = calculateAllCategoryScores(formData)[5];
        return (
          <FormSection 
            title="Furniture and Fixtures Assessment" 
            description="Evaluate furniture quality and compliance with RA 11394"
          >
            <WeightedScoreCard
              categoryName={furnitureScore.name}
              totalRating={furnitureScore.totalRating}
              maxPossibleScore={furnitureScore.maxPossibleScore}
              categoryScore={furnitureScore.categoryScore}
              weight={furnitureScore.weight}
              weightedScore={furnitureScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Chairs / Desks"
              description="Sufficient, comfortable, undamaged"
              rating={formData.furnitureFixtures.chairsDesks.rating}
              remarks={formData.furnitureFixtures.chairsDesks.remarks}
              onRatingChange={(rating) => handleRatingChange('furnitureFixtures', 'chairsDesks', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('furnitureFixtures', 'chairsDesks', remarks)}
            />

            <RatingSectionWithRemarks
              title="Neutral Desk (left-handed students)"
              description="Republic Act No. 11394 (RA 11394) makes it obligatory for all schools that makes use of armchairs in the classroom, to provide neutral desks to all students"
              rating={formData.furnitureFixtures.neutralDesk.rating}
              remarks={formData.furnitureFixtures.neutralDesk.remarks}
              onRatingChange={(rating) => handleRatingChange('furnitureFixtures', 'neutralDesk', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('furnitureFixtures', 'neutralDesk', remarks)}
            />

            <RatingSectionWithRemarks
              title="Teachers Table / Podium"
              description="Available and in good condition"
              rating={formData.furnitureFixtures.teachersTablePodium.rating}
              remarks={formData.furnitureFixtures.teachersTablePodium.remarks}
              onRatingChange={(rating) => handleRatingChange('furnitureFixtures', 'teachersTablePodium', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('furnitureFixtures', 'teachersTablePodium', remarks)}
            />

            <RatingSectionWithRemarks
              title="Whiteboard / Blackboard"
              description="Usable, clean, with markers/chalk"
              rating={formData.furnitureFixtures.whiteboardBlackboard.rating}
              remarks={formData.furnitureFixtures.whiteboardBlackboard.remarks}
              onRatingChange={(rating) => handleRatingChange('furnitureFixtures', 'whiteboardBlackboard', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('furnitureFixtures', 'whiteboardBlackboard', remarks)}
            />
          </FormSection>
        );

      case 8:
        // Space - 15% Weight
        const spaceScore = calculateAllCategoryScores(formData)[6];
        return (
          <FormSection 
            title="Space Assessment" 
            description="Evaluate classroom space adequacy and layout"
          >
            <WeightedScoreCard
              categoryName={spaceScore.name}
              totalRating={spaceScore.totalRating}
              maxPossibleScore={spaceScore.maxPossibleScore}
              categoryScore={spaceScore.categoryScore}
              weight={spaceScore.weight}
              weightedScore={spaceScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Room Capacity"
              description="Matches class size / avoids overcrowding"
              rating={formData.space.roomCapacity.rating}
              remarks={formData.space.roomCapacity.remarks}
              onRatingChange={(rating) => handleRatingChange('space', 'roomCapacity', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('space', 'roomCapacity', remarks)}
            />

            <RatingSectionWithRemarks
              title="Layout"
              description="Allows free movement and visibility"
              rating={formData.space.layout.rating}
              remarks={formData.space.layout.remarks}
              onRatingChange={(rating) => handleRatingChange('space', 'layout', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('space', 'layout', remarks)}
            />

            <RatingSectionWithRemarks
              title="Storage"
              description="Adequate space for materials"
              rating={formData.space.storage.rating}
              remarks={formData.space.storage.remarks}
              onRatingChange={(rating) => handleRatingChange('space', 'storage', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('space', 'storage', remarks)}
            />
          </FormSection>
        );

      case 9:
        // Disaster Preparedness - 10% Weight
        const disasterScore = calculateAllCategoryScores(formData)[7];
        return (
          <FormSection 
            title="Disaster Preparedness Assessment" 
            description="Evaluate safety and emergency preparedness"
          >
            <WeightedScoreCard
              categoryName={disasterScore.name}
              totalRating={disasterScore.totalRating}
              maxPossibleScore={disasterScore.maxPossibleScore}
              categoryScore={disasterScore.categoryScore}
              weight={disasterScore.weight}
              weightedScore={disasterScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Emergency Exits / Fire Safety"
              description="Presence of extinguisher / alarms (Clearly marked, accessible)"
              rating={formData.disasterPreparedness.emergencyExitsFireSafety.rating}
              remarks={formData.disasterPreparedness.emergencyExitsFireSafety.remarks}
              onRatingChange={(rating) => handleRatingChange('disasterPreparedness', 'emergencyExitsFireSafety', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('disasterPreparedness', 'emergencyExitsFireSafety', remarks)}
            />

            <RatingSectionWithRemarks
              title="Earthquake Preparedness"
              description="No falling hazards, safe layout"
              rating={formData.disasterPreparedness.earthquakePreparedness.rating}
              remarks={formData.disasterPreparedness.earthquakePreparedness.remarks}
              onRatingChange={(rating) => handleRatingChange('disasterPreparedness', 'earthquakePreparedness', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('disasterPreparedness', 'earthquakePreparedness', remarks)}
            />

            <RatingSectionWithRemarks
              title="Flood Safety"
              description="Elevated location, electrical outlets safe"
              rating={formData.disasterPreparedness.floodSafety.rating}
              remarks={formData.disasterPreparedness.floodSafety.remarks}
              onRatingChange={(rating) => handleRatingChange('disasterPreparedness', 'floodSafety', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('disasterPreparedness', 'floodSafety', remarks)}
            />

            <RatingSectionWithRemarks
              title="Safety Signages"
              description="Visible safety instructions / contact info"
              rating={formData.disasterPreparedness.safetySignages.rating}
              remarks={formData.disasterPreparedness.safetySignages.remarks}
              onRatingChange={(rating) => handleRatingChange('disasterPreparedness', 'safetySignages', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('disasterPreparedness', 'safetySignages', remarks)}
            />
          </FormSection>
        );

      case 10:
        // Inclusivity - 5% Weight
        const inclusivityScore = calculateAllCategoryScores(formData)[8];
        return (
          <FormSection 
            title="Inclusivity Assessment" 
            description="Evaluate compliance with RA 11313, RA 11650 for gender, religion, and disability inclusivity"
          >
            <WeightedScoreCard
              categoryName={inclusivityScore.name}
              totalRating={inclusivityScore.totalRating}
              maxPossibleScore={inclusivityScore.maxPossibleScore}
              categoryScore={inclusivityScore.categoryScore}
              weight={inclusivityScore.weight}
              weightedScore={inclusivityScore.weightedScore}
            />

            <RatingSectionWithRemarks
              title="Privacy in Comfort Rooms"
              description="Working locks, partitions that ensure safety and dignity"
              rating={formData.inclusivity.privacyInComfortRooms.rating}
              remarks={formData.inclusivity.privacyInComfortRooms.remarks}
              onRatingChange={(rating) => handleRatingChange('inclusivity', 'privacyInComfortRooms', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('inclusivity', 'privacyInComfortRooms', remarks)}
            />

            <RatingSectionWithRemarks
              title="Gender-Neutral Restrooms / Facilities"
              description="Availability or at least clear policies for safe CR access"
              rating={formData.inclusivity.genderNeutralRestrooms.rating}
              remarks={formData.inclusivity.genderNeutralRestrooms.remarks}
              onRatingChange={(rating) => handleRatingChange('inclusivity', 'genderNeutralRestrooms', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('inclusivity', 'genderNeutralRestrooms', remarks)}
            />

            <RatingSectionWithRemarks
              title="Safe Spaces"
              description="Seating arrangements promote equality (not segregated unless necessary)"
              rating={formData.inclusivity.safeSpaces.rating}
              remarks={formData.inclusivity.safeSpaces.remarks}
              onRatingChange={(rating) => handleRatingChange('inclusivity', 'safeSpaces', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('inclusivity', 'safeSpaces', remarks)}
            />

            <RatingSectionWithRemarks
              title="Classroom Assignment for Students with Special Needs"
              description="Students who are pregnant, lactating, or with disabilities are assigned to classrooms that are ground-floor, ramp-accessible, and near comfort rooms (e.g., Persons with Childcare, Pregnant, or with Disabilities)"
              rating={formData.inclusivity.classroomAssignmentSpecialNeeds.rating}
              remarks={formData.inclusivity.classroomAssignmentSpecialNeeds.remarks}
              onRatingChange={(rating) => handleRatingChange('inclusivity', 'classroomAssignmentSpecialNeeds', rating)}
              onRemarksChange={(remarks) => handleRemarksChange('inclusivity', 'classroomAssignmentSpecialNeeds', remarks)}
            />
          </FormSection>
        );

      case 11:
        // Assessment Summary
        const allCategoryScores = calculateAllCategoryScores(formData);
        const overallWeightedScore = calculateOverallWeightedScore(allCategoryScores);
        const ratingInterpretation = getRatingInterpretation(overallWeightedScore);
        const overallCondition = getOverallCondition(overallWeightedScore);

        return (
          <FormSection 
            title="Assessment Summary & Recommendations" 
            description="Review your assessment results and provide final observations"
          >
            {/* Overall Weighted Score Display - Prominent */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h4 className="text-2xl">Overall Classroom Assessment Score</h4>
                  <div className="text-6xl mb-2">{overallWeightedScore.toFixed(2)}</div>
                  <div className="text-xl bg-white/20 inline-block px-6 py-2 rounded-full">
                    {ratingInterpretation}
                  </div>
                  <p className="text-sm text-blue-100">Weighted Average Score (Out of 100%)</p>
                  <div className="text-base bg-white/10 inline-block px-4 py-1 rounded mt-2">
                    Condition: {overallCondition}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Categories Weighted Scores in Grid */}
            <div className="mt-8">
              <h4 className="text-lg text-slate-900 mb-4">Category Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allCategoryScores.map((category, index) => (
                  <WeightedScoreCard
                    key={index}
                    categoryName={category.name}
                    totalRating={category.totalRating}
                    maxPossibleScore={category.maxPossibleScore}
                    categoryScore={category.categoryScore}
                    weight={category.weight}
                    weightedScore={category.weightedScore}
                  />
                ))}
              </div>
            </div>

            {/* Final Assessment Section */}
            <FormSection title="Final Evaluation" description="Provide detailed observations and recommended actions" className="mt-8">
              <FormGrid columns={1}>
                <div>
                  <Label htmlFor="remarks" className="text-base">General Observations/Remarks:</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Enter general observations about the classroom..."
                    rows={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="recommendingActions" className="text-base">Recommending Actions/Improvements:</Label>
                  <Textarea
                    id="recommendingActions"
                    value={formData.recommendingActions}
                    onChange={(e) => setFormData(prev => ({ ...prev, recommendingActions: e.target.value }))}
                    placeholder="Enter recommended actions for improvement..."
                    rows={5}
                    className="mt-2"
                  />
                </div>
              </FormGrid>
            </FormSection>
          </FormSection>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Content - 2 columns on large screens (LEFT) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-8">
            <div className="min-h-[600px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-2 h-11"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            
              <div className="flex items-center space-x-4">
                {currentStep === formSteps.length ? (
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 px-8 py-2 h-11">
                    <Save className="w-4 h-4 mr-2" />
                    Submit Assessment
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-11">
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Sidebar - 1 column on the right (RIGHT & STICKY) */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-8">
          <FormStepper 
            steps={formSteps} 
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
      </div>
    </div>
  );
}
